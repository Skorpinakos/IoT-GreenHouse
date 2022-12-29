from fnmatch import translate
import numpy as np
from matplotlib import pyplot as plt

def figure_out_position(signal_history,signal,y1,max_deviation):
    window_size=7
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
        res=np.sum(np.absolute(to_compare_history-to_compare_signal))
        diffs.append(res)

        #break




    translation=diffs.index(min(diffs))+window_size-1
    print("error achieved:",min(diffs),diffs)
    print("trans",translation)
    
    position=0
    total_signal=signal_history.copy()
    total_signal.extend(signal[translation:])
    print("i guess the step was:",len(total_signal)-len(signal_history))
    #print(total_signal)

    plt.plot(signal_history)
    plt.plot(signal)
    plt.show()
    plt.plot(total_signal)

    plt.show()


    return position,total_signal
figure_out_position([0,1,2,3,5,1,1,0,1,2,3,4,5,6,7,0,1,2,3],[3,5,1,1,0,1,2,3,4,5,6,7,0,1,2,3,9,12],5,30)