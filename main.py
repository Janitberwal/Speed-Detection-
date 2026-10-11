import cv2
import supervision as sv
from ultralytics import YOLO
import numpy as np
from collections import defaultdict, deque
import os

TARGET_WIDTH = 25
TARGET_HEIGHT = 250

TARGET = np.array([
    [0, 0],
    [TARGET_WIDTH - 1, 0],
    [TARGET_WIDTH - 1, TARGET_HEIGHT - 1],
    [0, TARGET_HEIGHT - 1]
])

class ViewTransformer:
    def __init__(self, source: np.ndarray, target: np.ndarray):
        source = source.astype(np.float32)
        target = target.astype(np.float32)
        self.m = cv2.getPerspectiveTransform(source, target) 

    def transform_points(self, points: np.ndarray) -> np.ndarray:
        reshaped_points = points.reshape(-1, 1, 2).astype(np.float32)
        transformed_points = cv2.perspectiveTransform(reshaped_points, self.m)
        return transformed_points.reshape(-1, 2)

def process_video_file(input_path: str, output_path: str, source_points: list):
    video_info = sv.VideoInfo.from_video_path(input_path)
    model = YOLO("yolov8n.pt")
    byte_track = sv.ByteTrack(frame_rate=video_info.fps)

    dynamic_source = np.array(source_points)

    box_annotator = sv.BoxAnnotator(thickness=4)
    label_annotator = sv.LabelAnnotator(text_thickness=4, text_scale=2)
    frame_generator = sv.get_video_frames_generator(input_path)

    polygon_zone = sv.PolygonZone(dynamic_source) 
    view_transformer = ViewTransformer(source=dynamic_source, target=TARGET)

    coordinates = defaultdict(lambda: deque(maxlen=video_info.fps))
    
    fourcc = cv2.VideoWriter_fourcc(*'vp09')
    writer = cv2.VideoWriter(output_path, fourcc, video_info.fps, (video_info.width, video_info.height))

    unique_vehicles = set()
    max_speed_recorded = 0
    speeding_violations = 0

    for frame in frame_generator:
        result = model(frame, imgsz=640)[0]
        detections = sv.Detections.from_ultralytics(result)
        detections = detections[polygon_zone.trigger(detections)]
        detections = byte_track.update_with_detections(detections=detections)
        
        points = detections.get_anchors_coordinates(anchor=sv.Position.BOTTOM_CENTER)
        if len(points) > 0:
             points = view_transformer.transform_points(points=points).astype(int)
        else:
              points = np.empty((0, 2), dtype=int)

        labels = []

        for tracker_id, [_, y] in zip(detections.tracker_id, points):
            unique_vehicles.add(tracker_id)
            coordinates[tracker_id].append(y)
            
            if len(coordinates[tracker_id]) < video_info.fps / 2:
                labels.append(f"#{tracker_id}")
            else:
                coordinate_start = coordinates[tracker_id][-1]
                coordinate_end = coordinates[tracker_id][0]
                distance = abs(coordinate_start - coordinate_end)
                time = len(coordinates[tracker_id]) / video_info.fps
                speed = distance / time * 3.6
                
                if speed > max_speed_recorded:
                    max_speed_recorded = speed
                if speed > 60:
                    speeding_violations += 1
                    
                labels.append(f"#{tracker_id} {int(speed)} km/h")

        annotated_frame = frame.copy()
        annotated_frame = sv.draw_polygon(annotated_frame, polygon=dynamic_source, color=sv.Color.RED)
        annotated_frame = box_annotator.annotate(scene=annotated_frame, detections=detections)
        annotated_frame = label_annotator.annotate(scene=annotated_frame, detections=detections, labels=labels)

        writer.write(annotated_frame)
        
    writer.release()
    
    return {
        "totalVehicles": len(unique_vehicles),
        "maxSpeed": int(max_speed_recorded),
        "violations": speeding_violations
    }