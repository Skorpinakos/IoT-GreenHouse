import numpy as np
from matplotlib import pyplot as plt


def something(signal):
    high_noise_thres=int(40*len(signal)/1000)
    #print(high_noise_thres)


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
    return signal_filtered
    #############################################################################################################################################
f =open("diagnostics/items.txt",'r',encoding='utf-8')
data=f.read()
f.close()
data=data.strip().split("\n")
signal=list(map(int,data))
#print(signal)
signal.extend(signal)
signal.extend(signal)
signal.extend(signal)
signal.extend(signal)
signal.extend(signal)
plt.plot(signal)
plt.title('vertical scan signal')
plt.xlabel('line')
plt.ylabel('intensity')
plt.show()
filtered=something(signal)
plt.plot(filtered)
plt.title('vertical scan signal')
plt.xlabel('line')
plt.ylabel('intensity')
plt.show()