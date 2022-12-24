
import time
from s_clustering_utils import check_cluster_multitudes,find_elbow,find_centroids,plot_cluster_graph,plot_image_with_centers_lines,find_lines
from image_utils import detect_edges,edge_image_to_edge_points_np_list

path="Edge_Compute/images/"
out_path="Edge_Compute/diagnostics/"
filename='Capture5.png' #set image to test

def process_image(filename,path,out_path,diagnostics_mode='none'):

    t1=time.time()
    img,edge_image_good,edge_image_simple=detect_edges(filename,path,out_path,thres1=150,thres2=220) #takes image and 2 thresholding parameters for the edge filter, gives back the original image and the filtered image as cv2 img objects (basically numpy arrays, original image has color, filtered is B&W (no  rgb))
    t2=time.time()
    edge_point_list_good=edge_image_to_edge_points_np_list(edge_image_good)
    edge_point_list_simple=edge_image_to_edge_points_np_list(edge_image_simple) #takes filtered image and returns a list of all the white pixels (so any coordinate where part of an edge is present)
    test_cases=range(2,40) #set the possible cases for plant multitude (the algorithm will check for each number and find the best match, use as smaller range as possible and preferably weighted to the left to improve performance)
    t3=time.time()
    wcss=check_cluster_multitudes(test_cases,edge_point_list_simple) #gets error list from trying all possible test cases
    if diagnostics_mode=='full' or 'elbow' in diagnostics_mode:
        plot_cluster_graph(test_cases, wcss) #plots error list to get idea of elbo graph
    t4=time.time()
    n=find_elbow(wcss,test_cases) #finds where the elbow occurs in the error graph 
    t5=time.time()
    centers_x,centers_y,centers_ids_for_each_index_of_input_list=find_centroids(edge_point_list_good,n) #gets coordiantes of plant centers after running the algorithm once again for the correct n (could have stored data from the test cases run but one run doesn't cost as much, also this time we use more detail in the execution for optimal results and not just error estimation)
    t6=time.time()
    test_cases=range(1,14)
    lines_x,lines_y,labels=find_lines(test_cases,centers_x,centers_y) #lines_x currently returns 0 as it is not needed #labels is the correponding line for each center in input list
    #print(_)
    if diagnostics_mode=='full' or 'final' in diagnostics_mode:
        plot_image_with_centers_lines(img,path,out_path,centers_x,centers_y,lines_x,lines_y) #show image
    if diagnostics_mode=='full' or 'time' in diagnostics_mode:
        print('time for edge filter:              ',t2-t1)
        print('time to find errors for test cases:',t4-t3)
        print('time to find final centroids:      ',t6-t5)
        print('time for total run:                ',t6-t1)

#packing data in cluster dicts for export ##################################

    #make dict with center ids and points type: {7 : [[523.02,125.01] , ] ,}
    clustered_points={}
    centers=[]
    for i in range(len(centers_y)):
        centers.append([centers_y[i],centers_x[i]])
        clustered_points[i]=[]
    for i,point in enumerate(edge_point_list_good):
        clustered_points[centers_ids_for_each_index_of_input_list[i]].append(list(point))
    
    #make dict with center coords and points type: {[501.03,131.17] : [[523.02,125.01] , ] ,}
    centroids={}
    for i,center in enumerate(centers):
        centroids[tuple(center)]=clustered_points[i]
    #print(centroids)


    #make dict with lines and clusters type: {1 : [[523.02,125.01] , ] ,}
    clustered_centers={}

    for i in range(len(lines_y)):
        clustered_centers[i]=[]
    for i,center in enumerate(centers):
        clustered_centers[labels[i]].append(list(center))


    #make dict with lines and clusters ordered by line y dimension of line group  type: {123.003 : [[523.02,125.01] , ] ,}
    lines={}
    for line in list(clustered_centers.keys()):
        heights=[]
        for center in clustered_centers[line]:
            heights.append(center[0])
        lines[sum(heights)/len(heights)]=clustered_centers[line] #keep in mind that the average y might slightly differ from what kmeans returned as center





    #print(lines)


    return sorted(list(lines.keys())),lines,centroids #returns the sorted y coordinate of lines and the lines and centroids dicts 
#process_image(filename,path,out_path,"full")