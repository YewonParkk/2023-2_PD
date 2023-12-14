import cv2
import pytesseract
from tkinter import Tk, filedialog

# 파일 대화상자를 통해 이미지 파일을 선택한다
Tk().withdraw()  # Tkinter 창을 숨기기
image_path = filedialog.askopenfilename(initialdir='./png', title='이미지 선택', filetypes=(('png files', '*.png'),
                                                                                       ('jpg files', '*.jpg'),
                                                                                       ('all files', '*.*')))

# 이미지를 읽어옴
img = cv2.imread(image_path)

# 이미지가 정상적으로 열리는지 확인
if img is not None:
    config = ('-l kor+eng')
    roi_start, roi_end, roi_move = (-1, -1), (-1, -1), (-1, -1)
    dragging = False
    roi_selected = False

    # 마우스 드래그 이벤트를 처리하는 함수
    def drag_event(event, x, y, flags, param):
        global roi_start, roi_end, roi_move, dragging, roi_selected

        # 선택한 이미지의 왼쪽 상단 좌표 구하기
        if event == cv2.EVENT_LBUTTONDOWN:
            roi_start = (x, y)
            dragging = True

        # 선택하고 있는 현재 좌표 구하기
        elif event == cv2.EVENT_MOUSEMOVE:
            roi_move = (x, y)

        # 선택한 이미지의 오른쪽 하단 좌표 구하기
        elif event == cv2.EVENT_LBUTTONUP:
            roi_end = (x, y)
            dragging = False

            x1, y1 = min(roi_start[0], roi_end[0]), min(roi_start[1], roi_end[1])   # ROI의 왼쪽 상단 모서리 계산하기
            x2, y2 = max(roi_start[0], roi_end[0]), max(roi_start[1], roi_end[1])   # ROI의 오른쪽 하단 모서리 계산하기

            roi = img[y1:y2, x1:x2]

            if x2 - x1 > 0 and y2 - y1 > 0:
                cv2.imshow('cropped', roi)

                # tesseract를 이용해서 ocr을 진행하도록 한다
                ocr = pytesseract.image_to_string(roi, config=config)
                print(ocr)
                roi_selected = True

    cv2.namedWindow('img')
    cv2.setMouseCallback('img', drag_event)

    while True:
        temp_img = img.copy()

        if dragging:
            cv2.rectangle(temp_img, roi_start, roi_move, (255, 0, 255), 2)

        cv2.imshow('img', temp_img)

        if cv2.waitKey(1) & 0xFF == 27:  # ESC 키를 누르면 종료
            break

        if not dragging and roi_selected:
            break

    cv2.destroyAllWindows()

else:
    print("이미지를 불러오는 데에 실패했습니다.")