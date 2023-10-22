# wokdeepjs
Neural Network, Deep Learning, AI, Machine LEarning and Image Processing, using javascript

Required node version : v14.19.0
With NPM version : 6.14.16

1. First Create New folder :
- /dataset-feature
- /dataset-img

2. Install using ```npm install```


#use command 

#Convert Image
node .\main.js biner -i img\test\lena.png -o img\test_out\lena-biner.jpg
node .\main.js gray -i img\test\lena.png -o img\test_out\lena-gray.jpg

#extract Feature
node .\main.js extract -i dataset-img\mnist\ -o dataset-feature\mnist.xlsx

#training

node .\main.js training -i dataset-feature\mnist.xlsx -o model\mnist.json