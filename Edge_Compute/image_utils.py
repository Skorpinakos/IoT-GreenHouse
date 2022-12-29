import cv2
import numpy as np
from matplotlib import pyplot as plt


def detect_cutt_offs(weight_image,diagnostics_mode):
    cut_factor=1.0
    signal=[]
    for line in weight_image[0:-1]:
        signal.append(sum(line))

    high_noise_thres=int(40*len(signal)/1000)
    #print(high_noise_thres)
    #plt.plot(signal)
    #plt.title('vertical scan signal')
    #plt.xlabel('line')
    #plt.ylabel('intensity')
    #plt.show()

        ## Compute Fourier Transform
    n = len(signal)
    
    fhat = np.fft.fft(signal, n) #computes the fft
    
    #plt.plot(fhat)
    #plt.title('vertical scan signal FFT')
    #plt.xlabel('line')
    #plt.ylabel('intensity')
    #plt.show()


    fhat_clean = []
    for i,freq in enumerate(fhat):
        if i<=high_noise_thres:
            fhat_clean.append(freq)
        else:
            fhat_clean.append(0)


    signal_filtered = np.fft.ifft(fhat_clean) #inverse fourier transform
    signal_filtered=abs(signal_filtered)
    plant_edge=cut_factor*(min(signal_filtered)+max(signal_filtered))/2
    if "full" in diagnostics_mode or "sig" in diagnostics_mode:
        plt.plot(signal_filtered)
        plt.title('vertical scan signal filtered')
        plt.xlabel('line')
        plt.ylabel('intensity')
        p1 = [0, len(signal_filtered)]
        p2 = [max(signal_filtered),max(signal_filtered)]
        plt.plot(p1, p2, color="red", linewidth=3)
        p1 = [0, len(signal_filtered)]
        p2 = [min(signal_filtered),min(signal_filtered)]
        plt.plot(p1, p2, color="red", linewidth=3)
        p1 = [0, len(signal_filtered)]
        p2 = [plant_edge,plant_edge]
        plt.plot(p1, p2, color="red", linewidth=3)
        plt.show()
        #plt.wa
        
    
    norm=np.array(signal_filtered)
    norm.fill(plant_edge)
    normalized_signal=np.array(signal_filtered)-norm
    #plt.plot(normalized_signal)
    #plt.title('vertical scan signal filtered and normalized')
    #plt.xlabel('line')
    #plt.ylabel('intensity')
    #plt.show()

    #existance=np.sign(normalized_signal)
    zero_crossings = list(np.where(np.diff(np.sign(normalized_signal)))[0])
    diffs=np.diff(normalized_signal)
    #print(zero_crossings)
    if diffs[zero_crossings[0]]>0:
        pass
    else:
        zero_crossings=zero_crossings[1:]
    if diffs[zero_crossings[-1]]<0:
        pass 
    else:
        zero_crossings=zero_crossings[:-1]
        
    y1=zero_crossings[0]
    y2=zero_crossings[-1]
    return y1,y2,zero_crossings,signal_filtered

def edge_image_to_edge_points_np_list(edge_image,y1,y2):
    edge_point_list=[]
    for i,row in enumerate(edge_image):
        for j,cell in enumerate(row):
            if int(cell)>=128 and i>=y1 and i<=y2:
                edge_point_list.append([i,j])

    edge_point_list=np.array(edge_point_list)
    return edge_point_list

def detect_edges(filename,path,out_path, thres1=150,thres2=220): 
    # Read the original image
    img = cv2.imread(path+filename) 
    #print(img)
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
    cv2.imwrite(out_path+'edge_detection_result.png', edge_image)
    cv2.destroyAllWindows() 
    return img,edge_image,edge_image_simple


def detect_thres(filename,path,out_path, thres1=175,thres2=255): 
    # Read the original image
    img = cv2.imread(path+filename) 
    
    image_g = img[:,:,1]  #take green
    image_b = img[:,:,0] #take blue
    image_r = img[:,:,2] #take red
    image_r.fill(0)
    image=cv2.merge((image_r,image_g,image_b))
    #print(image)
    
    ret,image = cv2.threshold(img,thres1,thres2,cv2.THRESH_BINARY)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) #do grayscale
    

    #experiment
    image_simple=simplify_image(image)
    #img=simplify_image(img)
    # Save filtered result
    cv2.imwrite(out_path+'thresholding_result.png', image)
    cv2.destroyAllWindows() 
    return img,image,image_simple

def simplify_image(input_image):
    standard_length=589 #increase if results not right amount of plants, decrease for performance
    dimensions = input_image.shape
    #print(dimensions)
    ratio=dimensions[0]/dimensions[1]
    
    #return cv2.resize(input_image, dsize=(standard_length,int(ratio*standard_length)), interpolation=cv2.INTER_CUBIC) ignore untill fix y1,y2 discrepency when dimensions change
    return input_image