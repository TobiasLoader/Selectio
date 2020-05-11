
let tolerance;
let C;
let contiguous;
let originPix;
let selectionCols;
let colourSelect;
let pxLayer;
let pxBounds;
let currentPxEdge;
let groupSelect;
let img1;
let selected;
let hoverLayer;

let tom;
function preload() {
  tom = loadImage('Tom.jpg');
}

class img {
	constructor (IMG,x,y,w,h){
		this.IMG = IMG;
		this.history = 0;
		this.x = x;
		this.y = y;
		this.w = w;
		if (!w){
			this.w = IMG.width;
		} else {
			this.h = IMG.height;
		}
		if (!h){
			this.h = int(this.w*IMG.height/IMG.width);
		} else {
			this.h = h;
		}
		this.IMG.resize(this.w,this.h);
		this.modImgs = [];
		this.modImgs.push(createImage(this.w,this.h));
		this.modImgs[0].copy(this.IMG, 0, 0, this.w, this.h, 0, 0, this.w, this.h);
// 		this.layers = 
		this.selectNum = 1;
		this.depthForGraphic;
		this.maxDepthForGraphic;
		this.currentPxEdge;
		this.px = [];
		for (var i=0; i<this.w*this.h; i+=1){this.px.push(0);}
		this.pxLayer = [];
		for (var i=0; i<this.w*this.h; i+=1){this.pxLayer.push(0);}
	}
	
/*
	create() {
		let col;
		let strokeweight;
		fill(25);
		rect(this.x,this.y,this.w,this.h);
		for (var i=0; i<150; i+=1){
			col = random(0,255);
			strokeweight = random(20,60);
			stroke(col-10,col,col,random(100,255));
			strokeWeight(strokeweight);
			point(this.x + random(strokeweight/2,this.w-strokeweight/2),this.y+random(strokeweight/2,this.h-strokeweight/2));
		}
		strokeWeight(1);
		stroke(255,0,0);
		line(this.x,this.y,this.x+this.w,this.y);
		line(this.x,this.y+this.h,this.x+this.w,this.y+this.h);
		line(this.x,this.y,this.x,this.y+this.h);
		line(this.x+this.w,this.y,this.x+this.w,this.y+this.h);
	}
*/
	drawMod() {
		image(this.modImgs[this.history],this.x,this.y,this.w,this.h);
	}
	
	drawOriginal(){
		image(this.IMG,this.x,this.y,this.w,this.h);
	}
	
	newPixSelect(pix){
		this.px[pix] = this.depthForGraphic+1;
		this.pxLayer[pix] = this.selectNum;
		this.currentPxEdge[this.depthForGraphic].push(pix);
	}
	
	testPass(pix,c) {
		return abs(this.modImgs[this.history].pixels[4*(pix)]-c[0])+
			   abs(this.modImgs[this.history].pixels[4*(pix)+1]-c[1])+
			   abs(this.modImgs[this.history].pixels[4*(pix)+2]-c[2])<=3*tolerance;
	}

	newSelection(mX,mY) {
		if (mX>this.x && mX<this.x+this.w && mY>this.y && mY<this.y+this.h && this.selectNum<=10){
			this.modImgs[this.history].loadPixels();
			
			let index = (mX-this.x)+(mY-this.y)*this.w;
			
			C = [
				this.modImgs[this.history].pixels[4*(index)],
				this.modImgs[this.history].pixels[4*(index)+1],
				this.modImgs[this.history].pixels[4*(index)+2],
				this.modImgs[this.history].pixels[4*(index)+3]];
			
// 			print(C);
// 				print(str(4*index) + '  ' + str(this.modImgs[this.history].pixels.length) + '  ' + str(this.IMG.pixels.length))
			if (this.px[index]===0){
				
				
/*
				print('a' + str(this.modImgs[this.history].pixels[4*(index)]));
				this.modImgs[this.history].pixels[4*(index)] = 255;
				print('b' + str(this.modImgs[this.history].pixels[4*(index)]));
				this.modImgs[this.history].pixels[4*(index)+1] = 0;
				this.modImgs[this.history].pixels[4*(index)+2] = 0;
*/
							
				this.depthForGraphic = 1;
				this.px[index]=1;
				this.currentPxEdge = [[index]];
				this.pxLayer[index] = this.selectNum;
				while (this.currentPxEdge[this.depthForGraphic-1].length) {
					this.currentPxEdge.push([]);
					for (var i=0; i<this.currentPxEdge[this.depthForGraphic-1].length; i+=1){
						var pix = this.currentPxEdge[this.depthForGraphic-1][i];
						if (this.px[pix]===this.depthForGraphic && this.pxLayer[pix]===this.selectNum){
							if (this.px[pix-1]===0 && this.testPass(pix-1,C) && int(pix/this.w)===int((pix-1)/this.w)){this.newPixSelect(pix-1);}
							if (this.px[pix-1*this.w]===0 && this.testPass(pix-1*this.w,C)){this.newPixSelect(pix-1*this.w);}
							if (this.px[pix+1]===0 && this.testPass(pix+1,C) && int(pix/this.w)===int((pix+1)/this.w)){this.newPixSelect(pix+1);}
							if (this.px[pix+1*this.w]===0 && this.testPass(pix+1*this.w,C)){this.newPixSelect(pix+1*this.w);}
						}
					}
					this.depthForGraphic += 1;
				}
				if (!this.maxDepthForGraphic || this.depthForGraphic>this.maxDepthForGraphic){
					this.maxDepthForGraphic=this.depthForGraphic;
				}
				if (colourSelect){
					for (var pix=0; pix<this.px.length; pix+=1){
						if (this.px[pix] && this.pxLayer[pix]===this.selectNum){
							this.modImgs[this.history].pixels[4*(pix)] = selectionCols[(this.pxLayer[pix]-1)%selectionCols.length][0];
							this.modImgs[this.history].pixels[4*(pix)+1] = selectionCols[(this.pxLayer[pix]-1)%selectionCols.length][1];
							this.modImgs[this.history].pixels[4*(pix)+2] = selectionCols[(this.pxLayer[pix]-1)%selectionCols.length][2];
							this.modImgs[this.history].pixels[4*(pix)+3] = 255-255*(this.px[pix]/this.maxDepthForGraphic);
						}
					}
				}
				this.modImgs[this.history].updatePixels();
				if (!keyIsDown(16)){
					this.selectNum += 1;
				} else {
/*
					if (!groupSelect){
						this.selectNum += 1;
					}
*/
					groupSelect = true;
				}
			}
		}
	}
	
	selectToCol(col,select){
		this.modImgs[this.history].loadPixels();
		for (var pix=0; pix<this.px.length; pix+=1){
			if (this.pxLayer[pix]===select){
				this.modImgs[this.history].pixels[4*(pix)] = col[0];
				this.modImgs[this.history].pixels[4*(pix)+1] = col[1];
				this.modImgs[this.history].pixels[4*(pix)+2] = col[2];
				this.modImgs[this.history].pixels[4*(pix)+3] = 255;
			}
		}
		this.modImgs[this.history].updatePixels();
	}
}

function setup() {
	W = window.innerWidth;
	H = window.innerHeight;
	canvas = createCanvas(W, H);
	tolerance = 20; // 0 is MIN, 255 is MAX
	contiguous = true;
	C = [0,0,0];
	groupSelect = false;
	selected = 0;
	
	colourSelect = true;
	selectionCols = [[245, 66, 66],[252, 123, 3],[245, 224, 66],[130, 224, 130],[66, 135, 245],[133, 130, 224]];
	
	img1 = new img(tom,int(W/10),int(H/10),int(W/2));
	background(25);	
	img1.drawMod();
// 	img1.drawOriginal();
}

function selections(){
	textSize(14);
	strokeWeight(1);
	textFont('Lato Light');
	textAlign(RIGHT);
	for (var i=0; i<img1.selectNum; i+=1){
		if (i===selected){
			fill(255,255,255,180);
		} else {
			fill(255,255,255,100);
		}
		if (mouseX<W-40 && mouseX>W-60-textWidth('Background    ' + str(i)) && mouseY>40+50*(i) && mouseY<20+50*(i+1)){
			hoverLayer = i;
			cursor('pointer');
		}
		noStroke();
		if (!i){
			text('Background    ' + str(i),W-50,60+50*i);
		} else {
			text('Select Layer   ' + str(i),W-50,60+50*i);
			stroke(255,255,255,50);
			line(W-70,30+50*i,W-50,30+50*i);
		}
		
	}
}
function draw(){
	if (groupSelect && !keyIsDown(16)){
		img1.selectNum += 1;
		groupSelect = false;
	}
	updateScreen();
}

function updateScreen(){
	hoverLayer = -1;
	cursor('default');
	background(25);	
	img1.drawMod();
// 	img1.drawOriginal();
	selections();
}


function mouseClicked(){
	img1.newSelection(mouseX,mouseY);
	if (hoverLayer>=0){
		selected = hoverLayer;
	}
// 	updateScreen();
/*
	if (keyIsPressed){
		print('hey');
		img1.drawOriginal();
	}
*/
}

function mouseDragged(){
	img1.newSelection(mouseX,mouseY);
// 	updateScreen();
}

function keyTyped() {
  if (keyIsDown(83)) {
    img1.modImgs[img1.history].save('tom_new', 'png');
  }
  if (keyIsDown(66)) {
  	img1.selectToCol([0,0,0],selected);
  }
}

window.onresize = function() {
  resizeCanvas(windowWidth, windowHeight);
  W = windowWidth;
  H = windowHeight
};
