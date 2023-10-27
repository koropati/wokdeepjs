# wokdeepjs
Neural Network, Deep Learning, AI, Machine LEarning and Image Processing, using javascript

Required node version : v14.19.0
With NPM version : 6.14.16

1. First Create New folder :
- /dataset-feature
- /dataset-img

2. Install using ```npm install```

opencv-build-npm

#use command 

#Convert Image
node .\main.js biner -i img\test\lena.png -o img\test_out\lena-biner.jpg
node .\main.js biner -i img\test\meter.png -o img\test_out\meter-biner.jpg

node .\main.js gray -i img\test\lena.png -o img\test_out\lena-gray.jpg

node .\main.js prepwater -i img\test\meter.png -o img\test_out\meter-out.jpg

#segment image

node .\main.js segment -i img\test\angka.png -o img\test_out\

#extract Feature
node .\main.js extract -i dataset-img\mnist\train -o dataset-feature\mnist.xlsx
node .\main.js extract -i dataset-img\mnist\test -o dataset-feature\mnist-test.xlsx

#training

node .\main.js training -i dataset-feature\mnist.xlsx -o model\mnist.json

#testing

node .\main.js testing -m model\mnist.json -i dataset-feature\mnist-test.xlsx