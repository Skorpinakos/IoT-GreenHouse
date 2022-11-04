import cv2
from sklearn.cluster import KMeans
import numpy as np
from matplotlib import pyplot as plt
# Read the original image
img = cv2.imread('Capture.PNG') 
# Display original image

 
# Convert to graycsale
img_gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
# Blur the image for better edge detection
img_blur = cv2.GaussianBlur(img_gray, (3,3), 0) 
 
# Sobel Edge Detection
sobelx = cv2.Sobel(src=img_blur, ddepth=cv2.CV_64F, dx=1, dy=0, ksize=5) # Sobel Edge Detection on the X axis
sobely = cv2.Sobel(src=img_blur, ddepth=cv2.CV_64F, dx=0, dy=1, ksize=5) # Sobel Edge Detection on the Y axis
sobelxy = cv2.Sobel(src=img_blur, ddepth=cv2.CV_64F, dx=1, dy=1, ksize=5) # Combined X and Y Sobel Edge Detection
# Display Sobel Edge Detection Images

 
# Canny Edge Detection
edges = cv2.Canny(image=img_blur, threshold1=150, threshold2=220) # Canny Edge Detection
# Display Canny Edge Detection Image
cv2.imshow('Canny Edge Detection', edges)
cv2.waitKey(0)
edge_point_list=[]
for i,row in enumerate(edges):
    for j,cell in enumerate(row):
        if int(cell)>=128:
            edge_point_list.append([i,j])

edge_point_list=np.array(edge_point_list)
#print(edge_point_list)
#exit()

wcss = []
test_cases=range(10,22)
for i in test_cases:
    kmeans = KMeans(n_clusters=i, init='k-means++', max_iter=300, n_init=10, random_state=0)
    kmeans.fit(edge_point_list)
    wcss.append(kmeans.inertia_)
plt.plot(test_cases, wcss)
plt.title('Elbow Method')
plt.xlabel('Number of clusters')
plt.ylabel('WCSS')
plt.show()

kmeans = KMeans(n_clusters=18, init='k-means++', max_iter=500, n_init=25, random_state=0)
kmeans.fit(edge_point_list)
print(kmeans.cluster_centers_)

centers_y=kmeans.cluster_centers_[:,0]
centers_x=kmeans.cluster_centers_[:,1]


plt.imshow(img)
plt.plot(centers_x,centers_y,'o',color='yellow')
plt.show()

cv2.destroyAllWindows()