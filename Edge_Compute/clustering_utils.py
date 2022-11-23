from sklearn.cluster import KMeans
import numpy as np
from matplotlib import pyplot as plt
import math


def check_cluster_multitudes(test_cases,edge_point_list):
    wcss = []
    for i in test_cases:
        kmeans = KMeans(n_clusters=i, init='k-means++', max_iter=30, n_init=3, random_state=0)  #increase max_iter and n_init for more accurate error results for elbow graph and elbow finding, decrease for faster 'find errors for test cases' time
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
    #plot_cluster_graph(test_cases[:-2],diffs_of_diffs)

    #print('guessing ',n,' plants in photo')
    return n

def find_centroids(edge_point_list,n):
    kmeans = KMeans(n_clusters=n, init='k-means++', max_iter=80, n_init=6, random_state=0) #increase max_iter and n_init for better clustering , decrease for faster 'find final centroids' time
    kmeans.fit(edge_point_list)
    #print(kmeans.cluster_centers_)

    centers_y=kmeans.cluster_centers_[:,0]
    centers_x=kmeans.cluster_centers_[:,1]
    labels=kmeans.labels_
    #for i in range(len(labels)):
        #print(labels[i])
        #print(edge_point_list[i])
    return centers_x,centers_y,labels


def plot_image_with_centers_lines(img,path,out_path,centers_x,centers_y,_,lines_y):
    image_x_length=img.shape[1]
    plt.imshow(img)
    plt.plot(centers_x,centers_y,'o',color='yellow')
    for line in lines_y:
        p1 = [0, image_x_length]
        p2 = [line, line]
        plt.plot(p1, p2, color="red", linewidth=3)

 
    plt.savefig(out_path+'original image with centroids drawn.png')
    plt.show()



def find_lines(test_cases,_,centroids_y): #better use https://stackoverflow.com/questions/33629842/grouping-points-that-represent-lines
    point_list=[]
    centroids_x=[0]*len(centroids_y) 
    for point in range(len(centroids_y)):
        #print(centroids_y[point])
        point_list.append([centroids_x[point],centroids_y[point]])
    wcss=check_cluster_multitudes(test_cases,point_list)
    lines_multitude=find_elbow(wcss,test_cases)
    #print(lines_multitude)
    results_y,results_x,labels=find_centroids(point_list,lines_multitude)
    #print(results_y,j,i)
    return results_x,results_y,labels

