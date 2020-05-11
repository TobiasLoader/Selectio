
let tolerance;
let C;
let contiguous;
let originPix;
let selectionCols;
let colourSelect;
let pxLayer;
let pxBounds;
let currentPxEdge;
let img1;

let tom;
function preload() {
  tom = loadImage('Tom.jpg');
}

class img {
	constructor (IMG,x,y,w,h){
		this.IMG = IMG;
		this.modImg = IMG;
		this.x = x;
		this.y = y;
		this.w = w;
		if (!h){
			this.h = this.w*IMG.height/IMG.width
		} else {
			this.h = h;
		}
		this.selectNum = 0;
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
	draw() {
		image(this.modImg,this.x,this.y,this.w,this.h);
	}
	
	newPixSelect(pix){
		this.px[pix] = this.depthForGraphic+1;
		this.pxLayer[pix] = this.selectNum;
		this.currentPxEdge[this.depthForGraphic].push(pix);
	}
	
	testPass(pix,c) {
		return abs(pixels[4*(this.x + this.y*W + (pix%this.w) + int(pix/this.w)*W)]-c[0])+
			   abs(pixels[4*(this.x + this.y*W + (pix%this.w) + int(pix/this.w)*W)+1]-c[1])+
			   abs(pixels[4*(this.x + this.y*W + (pix%this.w) + int(pix/this.w)*W)+2]-c[2])<=3*tolerance;
	}

	newSelection(mX,mY) {
		if (mX>this.x && mX<this.x+this.w && mY>this.y && mY<this.y+this.h){
			loadPixels();
			
			C = [
				pixels[4*(mX+mY*W)],
				pixels[4*(mX+mY*W)+1],
				pixels[4*(mX+mY*W)+2],
				pixels[4*(mX+mY*W)+3]];
				
			if (this.px[(mX-this.x)+(mY-this.y)*this.w]===0){
				this.depthForGraphic = 1;
				this.px[(mX-this.x)+(mY-this.y)*this.w]=1;
				this.currentPxEdge = [[(mX-this.x)+(mY-this.y)*this.w]];
				this.pxLayer[(mX-this.x)+(mY-this.y)*this.w] = this.selectNum;
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
						if (this.px[pix]){
							pixels[4*(this.x + this.y*W + (pix%this.w) + int(pix/this.w)*W)] = selectionCols[this.pxLayer[pix]%selectionCols.length][0];
							pixels[4*(this.x + this.y*W + (pix%this.w) + int(pix/this.w)*W)+1] = selectionCols[this.pxLayer[pix]%selectionCols.length][1];
							pixels[4*(this.x + this.y*W + (pix%this.w) + int(pix/this.w)*W)+2] = selectionCols[this.pxLayer[pix]%selectionCols.length][2];
							pixels[4*(this.x + this.y*W + (pix%this.w) + int(pix/this.w)*W)+3] = 255-255*(this.px[pix]/this.maxDepthForGraphic);
						}
					}
				}
				updatePixels();
				this.selectNum += 1;
			}
		}
	}
}

function setup() {
	W = window.innerWidth;
	H = window.innerHeight;
	canvas = createCanvas(W, H);
	tolerance = 40; // 0 is MIN, 255 is MAX
	contiguous = true;
	C = [0,0,0];
	
	colourSelect = true;
	selectionCols = [[245, 66, 66],[252, 123, 3],[245, 224, 66],[130, 224, 130],[66, 135, 245],[133, 130, 224]];
	
	img1 = new img(tom,int(W/10),int(H/10),int(W/2));
	background(25);	
	img1.draw();
}

function selections(){
	fill(255);
	for (var i=0; i<img1.selectNum; i+=1){
		text(i,W-100,20+20*i);
	}
}
/*

function draw(){
	background(25);	
	img1.draw();
	selections();
}
*/


function mouseClicked(){
	img1.newSelection(mouseX,mouseY);
}

function mouseDragged(){
	img1.newSelection(mouseX,mouseY);
}

window.onresize = function() {
  resizeCanvas(windowWidth, windowHeight);
  W = windowWidth;
  H = windowHeight
};
