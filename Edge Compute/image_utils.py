import cv2
import numpy as np

def edge_image_to_edge_points_np_list(edge_image):
    edge_point_list=[]
    for i,row in enumerate(edge_image):
        for j,cell in enumerate(row):
            if int(cell)>=128:
                edge_point_list.append([i,j])

    edge_point_list=np.array(edge_point_list)
    return edge_point_list

def detect_edges(filename,thres1=150,thres2=220): 
    # Read the original image
    img = cv2.imread(filename) 
    # Convert to graycsale
    img_gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    # Blur the image for better edge detection
    img_blur = cv2.GaussianBlur(img_gray, (3,3), 0) 
    # Sobel Edge Detection
    sobelx = cv2.Sobel(src=img_blur, ddepth=cv2.CV_64F, dx=1, dy=0, ksize=5) # Sobel Edge Detection on the X axis
    sobely = cv2.Sobel(src=img_blur, ddepth=cv2.CV_64F, dx=0, dy=1, ksize=5) # Sobel Edge Detection on the Y axis
    sobelxy = cv2.Sobel(src=img_blur, ddepth=cv2.CV_64F, dx=1, dy=1, ksize=5) # Combined X and Y Sobel Edge Detection
    # Canny Edge Detection
    edge_image = cv2.Canny(image=img_blur, threshold1=thres1, threshold2=thres2) # Canny Edge Detection
    #experiment
    edge_image_simple=simplify_image(edge_image)
    #img=simplify_image(img)
    # Save filtered result
    cv2.imwrite('edge_detection_result.png', edge_image)
    cv2.destroyAllWindows() 
    return img,edge_image,edge_image_simple

def simplify_image(input_image):
    standard_length=450 #increase if results not right amount of plants, decrease for performance
    dimensions = input_image.shape
    #print(dimensions)
    ratio=dimensions[0]/dimensions[1]
    
    return cv2.resize(input_image, dsize=(standard_length,int(ratio*standard_length)), interpolation=cv2.INTER_CUBIC)