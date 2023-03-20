
import numpy as np
from matplotlib import pyplot as plt

def figure_out_position(signal_history,signal,y1,y2,diagnostics='full'):
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

    
        
        total_signal=signal_history.copy()
        total_signal.extend(signal[translation:])
        if 'full' in diagnostics or 'step' in diagnostics:
            print("i guess the step was:",len(total_signal)-len(signal_history))
        #print(total_signal)
        if i ==0:
            break
    if 'full' in diagnostics or 'history' in diagnostics:
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
    if 'full' in diagnostics or 'norm' in diagnostics:
        plt.plot(normalized_signal)
        plt.title('vertical scan signal filtered and normalized')
        plt.xlabel('line')
        plt.ylabel('intensity')
        plt.show()

    #existance=np.sign(normalized_signal)
    zero_crossings = list(np.where(np.diff(np.sign(normalized_signal)))[0])
    #print(zero_crossings)
    
    diffs=np.diff(normalized_signal)
    zero_crossings_cut=[]
    current_frame_offset=len(total_signal)-len(signal)-1
    #print(y1+current_frame_offset)
    #print(y2+current_frame_offset)
    wiggle=3
    for crossing in zero_crossings:
        if crossing<=y2+current_frame_offset+wiggle:
            zero_crossings_cut.append(crossing)
    
    if diffs[zero_crossings_cut[0]]>0:
        pass
    else:
        zero_crossings_cut=zero_crossings_cut[1:]
    if diffs[zero_crossings_cut[-1]]<0:
        pass 
    else:
        zero_crossings_cut=zero_crossings_cut[:-1]
        
    #print(zero_crossings_cut)
    return total_signal,int(len(zero_crossings_cut)/2)
#figure_out_position([0,1,2,3,5,1,1,0,1,2,3,4,5,6,7,0,1,2,3],[3,5,1,1,0,1,2,3,4,5,6,7,0,1,2,3,9,12],5)