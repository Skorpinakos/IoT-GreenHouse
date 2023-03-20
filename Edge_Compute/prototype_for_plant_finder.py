
### imports
import time
from s_clustering_utils import check_cluster_multitudes,find_elbow,find_centroids,plot_cluster_graph,plot_image_with_centers_lines,find_lines
from image_utils import detect_edges,edge_image_to_edge_points_np_list,detect_thres,detect_cutt_offs
###

### packeting class
class Packet_of_Processing_Results():
    def __init__(self,lines_y,lines,centroids,signal,y1,y2):
        self.lines_y=lines_y
        self.lines=lines
        self.centroids=centroids
        self.signal=signal
        self.y1=y1
        self.y2=y2
###

def process_image(filename,path,out_path,config,diagnostics_mode='none'):
    #print(config)
    column_multitude=config['columns']

    t1=time.time()
    _,weight_image,_=detect_thres(filename,path,out_path,thres1=145,thres2=255) #takes image and 2 thresholding parameters for the edge filter, gives back the original image and the filtered image as cv2 img objects (basically numpy arrays, original image has color, filtered is B&W (no  rgb))
    y1,y2,lines_start_end,signal=detect_cutt_offs(weight_image,diagnostics_mode)
    img,edge_image_good,edge_image_simple=detect_edges(filename,path,out_path,thres1=150,thres2=220) #takes image and 2 thresholding parameters for the edge filter, gives back the original image and the filtered image as cv2 img objects (basically numpy arrays, original image has color, filtered is B&W (no  rgb))
    lines=int(len(lines_start_end)/2)
    t2=time.time()
    edge_point_list_good=edge_image_to_edge_points_np_list(edge_image_good,y1,y2)
    edge_point_list_simple=edge_image_to_edge_points_np_list(edge_image_simple,y1,y2) #takes filtered image and returns a list of all the white pixels (so any coordinate where part of an edge is present)
    test_cases=range(max(4,int((lines-1.5)*column_multitude)),int((lines+1.5)*column_multitude)) #set the possible cases for plant multitude (the algorithm will check for each number and find the best match, use as smaller range as possible and preferably weighted to the left to improve performance)
    t3=time.time()
    wcss=check_cluster_multitudes(test_cases,edge_point_list_simple) #gets error list from trying all possible test cases
    if diagnostics_mode=='full' or 'elbow' in diagnostics_mode:
        plot_cluster_graph(test_cases, wcss) #plots error list to get idea of elbo graph
    t4=time.time()
    n=find_elbow(wcss,test_cases) #finds where the elbow occurs in the error graph 
    t5=time.time()
    centers_x,centers_y,centers_ids_for_each_index_of_input_list=find_centroids(edge_point_list_good,n) #gets coordiantes of plant centers after running the algorithm once again for the correct n (could have stored data from the test cases run but one run doesn't cost as much, also this time we use more detail in the execution for optimal results and not just error estimation)
    t6=time.time()
    #test_cases=range(1,6)
    #lines_x,lines_y,labels=find_lines(test_cases,centers_x,centers_y) #lines_x currently returns 0 as it is not needed #labels is the correponding line for each center in input list
    #print(_)
    lines_y=[]
    lines_x=[]
    labels=[]
    lines=[]
    #print(lines_start_end)
    for x in range(0, len(lines_start_end)-1, 2):
        lines.append([lines_start_end[x],lines_start_end[x+1]])
    #print(lines)
    for i,line in enumerate(lines):
        lines_y.append((line[0]+line[1])/2)
        #print(lines_y[-1])
        labels.append(i)

    if diagnostics_mode=='full' or 'final' in diagnostics_mode:
        plot_image_with_centers_lines(img,path,out_path,centers_x,centers_y,lines_x,lines_y,y1,y2) #show image
    if diagnostics_mode=='fullERROR' or 'time' in diagnostics_mode:
        print('time for edge filter:              ',t2-t1)
        print('time to find errors for test cases:',t4-t3)
        print('time to find final centroids:      ',t6-t5)
        print('time for total run:                ',t6-t1)

#packing data in cluster dicts for export ##################################

    #make dict with center ids and points type: {7 : [[523,125] , ] ,}
    clustered_points={}
    centers=[]
    for i in range(len(centers_y)):
        centers.append([centers_y[i],centers_x[i]])
        clustered_points[i]=[]
    for i,point in enumerate(edge_point_list_good):
        clustered_points[centers_ids_for_each_index_of_input_list[i]].append(list(point))
    
    #make dict with center coords and points type: {[501.03,131.17] : [[523,125] , ] ,}
    centroids={}
    for i,center in enumerate(centers):
        centroids[tuple([int(center[0]),int(center[1])])]=clustered_points[i]
    #print(centroids)


    #make dict with lines and clusters type: {1 : [[523.02,125.01] , ] ,}
    clustered_centers={}

    for i in range(len(lines_y)):
        clustered_centers[i]=[]
    for i,center in enumerate(list(centroids.keys())):
        height=center[0]
        distances=[]
        for line in lines_y:
            distances.append(abs(line-height))
        my_index=distances.index(min(distances))
        clustered_centers[my_index].append(list(center))


    #make dict with lines and clusters ordered by line y dimension of line group  type: {123.003 : [[523.02,125.01] , ] ,}
    lines={}
    for line in list(clustered_centers.keys()):
        heights=[]
        if len(clustered_centers)==0:
            continue
        for center in clustered_centers[line]:
            heights.append(center[0])
        if len(heights)==0:
            continue
        lines[sum(heights)/len(heights)]=clustered_centers[line] #keep in mind that the average y might slightly differ from what kmeans returned as center
    #print(lines)





    #print(lines)


    return Packet_of_Processing_Results(sorted(list(lines.keys())),lines,centroids,signal,y1,y2)

#returns sorted "y dimension" list of lines (floats)
#returns lines dict where key is y dimension of line and value is list of cluster centers as 2 element lists [y,x]  y and x are integers representing pixels (floats not good idea for keys later)
#returns centers dict where key is tuple of integer ( y,x ) representing cluster center and value is list of all points (integer list of [y,x]) belonging to that center
#returns signal from cropping process
#returns top cropping height
