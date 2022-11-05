import cv2
from sklearn.cluster import KMeans
import numpy as np
from matplotlib import pyplot as plt
import math
import time

#################### FUNCS ####################################################################
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
    # Save filtered result
    cv2.imwrite('edge_detection_result.png', edge_image)
    return img,edge_image

def check_cluster_multitudes(test_cases,edge_point_list):
    wcss = []
    for i in test_cases:
        kmeans = KMeans(n_clusters=i, init='k-means++', max_iter=20, n_init=3, random_state=0)  #increase max_iter and n_init for more accurate error results for elbow graph and elbow finding, decrease for faster 'find errors for test cases' time
        kmeans.fit(edge_point_list)
        wcss.append(kmeans.inertia_)
    return wcss

def plot_cluster_graph(test_cases, wcss):
    plt.plot(test_cases, wcss)
    plt.title('Elbow Method')
    plt.xlabel('Number of clusters')
    plt.ylabel('WCSS')
    plt.show()

def find_elbow(wcss,test_cases):
    #basically get wcss, derive once, make abs(),derive again, make abs,find index of maximum, add 1 and you get the elbow index
    diffs=list(map(abs,np.diff(wcss)))
    diffs_log=list(map(math.log,diffs))
    diffs_of_diffs=list(map(abs,np.diff(diffs_log)))
    n=test_cases[diffs_of_diffs.index(max(diffs_of_diffs))+1]  #basically +2 cuse of double derivation and -1 because of list index starting from 0

    #print('guessing ',n,' plants in photo')
    return n

def find_centroids(edge_point_list,n):
    kmeans = KMeans(n_clusters=n, init='k-means++', max_iter=150, n_init=10, random_state=0) #increase max_iter and n_init for better clustering , decrease for faster 'find final centroids' time
    kmeans.fit(edge_point_list)
    #print(kmeans.cluster_centers_)

    centers_y=kmeans.cluster_centers_[:,0]
    centers_x=kmeans.cluster_centers_[:,1]
    return centers_x,centers_y


def plot_image_with_centers(img,centers_x,centers_y):
    plt.imshow(img)
    plt.plot(centers_x,centers_y,'o',color='yellow')
    plt.savefig('original image with centroids drawn.png')
    plt.show()

###############################################################################################


filename='Capture1.png' #set image to test
t1=time.time()
img,edge_image=detect_edges(filename,thres1=150,thres2=220) #takes image and 2 thresholding parameters for the edge filter, gives back the original image and the filtered image as cv2 img objects (basically numpy arrays, original image has color, filtered is B&W (no  rgb))
t2=time.time()
edge_point_list=edge_image_to_edge_points_np_list(edge_image) #takes filtered image and returns a list of all the white pixels (so any coordinate where part of an edge is present)
test_cases=range(2,20) #set the possible cases for plant multitude (the algorithm will check for each number and find the best match, use as smaller range as possible and preferably weighted to the left to improve performance)
t3=time.time()
wcss=check_cluster_multitudes(test_cases,edge_point_list) #gets error list from trying all possible test cases
#plot_cluster_graph(test_cases, wcss) #plots error list to get idea of elbo graph
t4=time.time()
n=find_elbow(wcss,test_cases) #finds where the elbow occurs in the error graph 
t5=time.time()
centers_x,centers_y=find_centroids(edge_point_list,n) #gets coordiantes of plant centers after running the algorithm once again for the correct n (could have stored data from the test cases run but one run doesn't cost as much, also this time we use more detail in the execution for optimal results and not just error estimation)
t6=time.time()
plot_image_with_centers(img,centers_x,centers_y) #show image
cv2.destroyAllWindows() #closes windows
print('time for edge filter:              ',t2-t1)
print('time to find errors for test cases:',t4-t3)
print('time to find final centroids:      ',t6-t5)
print('time for total run:                ',t6-t1)