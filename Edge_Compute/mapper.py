from fnmatch import translate
import numpy as np
from matplotlib import pyplot as plt

def figure_out_position(signal_history,signal,y1):
    window_size=70
    signal_size=len(signal)
    to_compare_history=np.array(signal_history[-window_size:])
    diffs=[]
    for possible_trans in range(0,len(signal)-window_size-1):
        to_compare_signal=np.array(signal[possible_trans:possible_trans+window_size])
        #print(to_compare_signal)
        #print(to_compare_history)
        #print("_____________________________")
        #print(len(to_compare_history))
        #print(len(to_compare_signal))
        #print(possible_overlap,len(to_compare_history))
        res=np.sum(np.square(to_compare_history-to_compare_signal))
        diffs.append(res)

        #break


    sorted_diffs=diffs.copy()
    sorted_diffs.sort()
    for i,possible_index in enumerate(sorted_diffs):
        translation=diffs.index(possible_index)+window_size-1
        #print("error achieved:",min(diffs))#,diffs)
        #print("trans",translation)

    
        position=0
        total_signal=signal_history.copy()
        total_signal.extend(signal[translation:])
        print("i guess the step was:",len(total_signal)-len(signal_history))
        #print(total_signal)
        if i ==0:
            break

    plt.plot(signal_history)
    plt.plot(signal)
    plt.show()
    plt.plot(total_signal)

    plt.show()
        ####IMPORTANT following algorithm has to be the same used in image_utils.py where it detects lines
    high_noise_thres=int(40*len(total_signal)/1000)
    #print(high_noise_thres)
    #plt.plot(signal)
    #plt.title('vertical scan signal')
    #plt.xlabel('line')
    #plt.ylabel('intensity')
    #plt.show()

        ## Compute Fourier Transform
    n = len(total_signal)
    
    fhat = np.fft.fft(total_signal, n) #computes the fft
    
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
    cut_factor=1.0
    plant_edge=cut_factor*(min(signal_filtered)+max(signal_filtered))/2
    
        
    
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
        

    return position,total_signal,int(len(zero_crossings)/2)
#figure_out_position([0,1,2,3,5,1,1,0,1,2,3,4,5,6,7,0,1,2,3],[3,5,1,1,0,1,2,3,4,5,6,7,0,1,2,3,9,12],5)