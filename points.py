import cv2

# Path to your video or image
path = "C:/Users/itsme/Downloads/car1.mp4"

# Open video
cap = cv2.VideoCapture(path)

# Read one frame
ret, frame = cap.read()

if not ret:
    print("Failed to read video frame!")
    cap.release()
    exit()

# Callback function to capture mouse click
def get_coords(event, x, y, flags, param):
    if event == cv2.EVENT_LBUTTONDOWN:
        print(f"({x}, {y})")
        # Draw point on frame (optional)
        cv2.circle(frame, (x, y), 5, (0, 0, 255), -1)
        cv2.imshow("Frame", frame)

cv2.imshow("Frame", frame)
cv2.setMouseCallback("Frame", get_coords)

print("Click points on the video frame. Press 'q' to exit.")
while True:
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cv2.destroyAllWindows()
cap.release()
