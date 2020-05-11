
let tolerance;
let C;
let selectionCols;
let pxLayer;
let currentPxEdge;
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
		this.layers = [];
		this.layers.push(createImage(this.w,this.h));
		this.layers[0].copy(this.IMG, 0, 0, this.w, this.h, 0, 0, this.w, this.h);
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
	drawMod(h) {
		if (!h){
			h = this.history;
		}
		image(this.modImgs[h],this.x,this.y,this.w,this.h);
	}
	
	drawOriginal(){
		image(this.IMG,this.x,this.y,this.w,this.h);
	}
		
	drawLayer(layer) {
		if (layer < this.selectNum){
			image(this.layers[layer],this.x,this.y,this.w,this.h);
		} else {
			this.drawMod();
		}
	}
	
	newPixSelect(pix){
		this.px[pix] = this.depthForGraphic+1;
		this.pxLayer[pix] = selected;
		this.currentPxEdge[this.depthForGraphic].push(pix);
	}
	
	testPass(pix,c) {
		return abs(this.modImgs[this.history].pixels[4*(pix)]-c[0])+
			   abs(this.modImgs[this.history].pixels[4*(pix)+1]-c[1])+
			   abs(this.modImgs[this.history].pixels[4*(pix)+2]-c[2])<=3*tolerance;
	}

	newSelection(mX,mY) {
		if (mX>this.x && mX<this.x+this.w && mY>this.y && mY<this.y+this.h && this.selectNum<=8){
			let index = (mX-this.x)+(mY-this.y)*this.w;
			if (this.px[index]===0){
				if (!selected || selected===this.selectNum){
					this.layers.push(createImage(this.w,this.h));
					this.layers[this.selectNum].copy(this.modImgs[this.history], 0, 0, this.w, this.h, 0, 0, this.w, this.h);
					this.selectNum += 1;
					selected = this.selectNum-1;
				}
			
				this.modImgs[this.history].loadPixels();
				
				C = [
					this.modImgs[this.history].pixels[4*(index)],
					this.modImgs[this.history].pixels[4*(index)+1],
					this.modImgs[this.history].pixels[4*(index)+2],
					this.modImgs[this.history].pixels[4*(index)+3]];
				
				this.modImgs[this.history].updatePixels();
	
				this.depthForGraphic = 1;
				this.px[index]=1;
				this.currentPxEdge = [[index]];
				this.pxLayer[index] = selected;
				while (this.currentPxEdge[this.depthForGraphic-1].length) {
					this.currentPxEdge.push([]);
					for (var i=0; i<this.currentPxEdge[this.depthForGraphic-1].length; i+=1){
						var pix = this.currentPxEdge[this.depthForGraphic-1][i];
						if (this.px[pix]===this.depthForGraphic && this.pxLayer[pix]===selected){
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
				
				this.layers[0].loadPixels();
				this.layers[selected].loadPixels();
				if (colourSelect){
					for (var pix=0; pix<this.px.length; pix+=1){
						if (this.px[pix] && this.pxLayer[pix]===selected){
							this.layers[selected].pixels[4*(pix)] = selectionCols[(this.pxLayer[pix]-1)%selectionCols.length][0];
							this.layers[selected].pixels[4*(pix)+1] = selectionCols[(this.pxLayer[pix]-1)%selectionCols.length][1];
							this.layers[selected].pixels[4*(pix)+2] = selectionCols[(this.pxLayer[pix]-1)%selectionCols.length][2];
							this.layers[selected].pixels[4*(pix)+3] = 255-255*(this.px[pix]/this.maxDepthForGraphic);
							
							this.layers[0].pixels[4*(pix)] = selectionCols[(this.pxLayer[pix]-1)%selectionCols.length][0];
							this.layers[0].pixels[4*(pix)+1] = selectionCols[(this.pxLayer[pix]-1)%selectionCols.length][1];
							this.layers[0].pixels[4*(pix)+2] = selectionCols[(this.pxLayer[pix]-1)%selectionCols.length][2];
							this.layers[0].pixels[4*(pix)+3] = 255-255*(this.px[pix]/this.maxDepthForGraphic);
						}
					}
				}
				this.layers[selected].updatePixels();
				this.layers[0].updatePixels();
			}
		}
	}
	
	selectToCol(col,select){
		if (this.history===this.modImgs.length-1){
			this.modImgs.push(createImage(this.w,this.h));
			this.history += 1;
			this.modImgs[this.history].copy(this.modImgs[this.history-1], 0, 0, this.w, this.h, 0, 0, this.w, this.h);
		}
		this.modImgs[this.history].loadPixels();
		for (var layer=0; layer<this.selectNum; layer+=1){
			this.layers[layer].loadPixels();
		}
		for (var pix=0; pix<this.px.length; pix+=1){
			if (this.pxLayer[pix]===select){
				this.modImgs[this.history].pixels[4*(pix)] = col[0];
				this.modImgs[this.history].pixels[4*(pix)+1] = col[1];
				this.modImgs[this.history].pixels[4*(pix)+2] = col[2];
				this.modImgs[this.history].pixels[4*(pix)+3] = 255;
				for (var layer=1; layer<this.selectNum; layer+=1){
					if (layer !== select){
						this.layers[layer].pixels[4*(pix)] = col[0];
						this.layers[layer].pixels[4*(pix)+1] = col[1];
						this.layers[layer].pixels[4*(pix)+2] = col[2];
						this.layers[layer].pixels[4*(pix)+3] = 255;
					}
				}
			}
		}
		this.modImgs[this.history].updatePixels();
		for (var layer=0; layer<this.selectNum; layer+=1){
			this.layers[layer].updatePixels();
		}
		selected = this.selectNum;
	}
	
	clearLayer(layer){
		this.layers[layer].copy(this.modImgs[this.history], 0, 0, this.w, this.h, 0, 0, this.w, this.h);
		for (var pix=0; pix<this.px.length; pix+=1){
			if (this.pxLayer[pix]===layer){
				this.pxLayer[pix] = 0;
				this.px[pix] = 0;
			}
		}
		this.layers[0].copy(this.modImgs[this.history], 0, 0, this.w, this.h, 0, 0, this.w, this.h);
		this.layers[0].loadPixels();
		for (var pix=0; pix<this.px.length; pix+=1){
			if (this.pxLayer[pix]) {
				this.layers[0].pixels[4*(pix)] = selectionCols[(this.pxLayer[pix]-1)%selectionCols.length][0];
				this.layers[0].pixels[4*(pix)+1] = selectionCols[(this.pxLayer[pix]-1)%selectionCols.length][1];
				this.layers[0].pixels[4*(pix)+2] = selectionCols[(this.pxLayer[pix]-1)%selectionCols.length][2];
				this.layers[0].pixels[4*(pix)+3] = 255-255*(this.px[pix]/this.maxDepthForGraphic);
			}
		}
		this.layers[0].updatePixels();
	}
	
	undo(){
		if (this.history){
			this.history -= 1;
		}
	}
	
	redo(){
		if (this.history<this.modImgs.length-1){
			this.history += 1;
		}
	}
}

function setup() {
	W = window.innerWidth;
	H = window.innerHeight;
	canvas = createCanvas(W, H);
	tolerance = 20; // 0 is MIN, 255 is MAX
	C = [0,0,0];
	selected = 0;
	
	colourSelect = true;
	selectionCols = [[245, 66, 66],[252, 123, 3],[245, 224, 66],[130, 224, 130],[66, 135, 245],[133, 130, 224]];
	
	img1 = new img(tom,int(W/10),int(H/10),int(7*W/12));
	background(25);	
	img1.drawMod();
// 	img1.drawOriginal();
}

function selections(){
	textSize(14);
	strokeWeight(1);
	textFont('Lato Light');
	textAlign(RIGHT);
	for (var i=0; i<img1.selectNum+1; i+=1){
		if (i===selected){
			fill(255,255,255,180);
		} else {
			fill(255,255,255,100);
		}
		if (mouseX<W-40 && mouseX>W-60-textWidth('All Selected    ' + str(i)) && mouseY>40+50*(i) && mouseY<20+50*(i+1)){
			hoverLayer = i;
			cursor('pointer');
		}
		noStroke();
		if (!i){
			text('All Selected    ' + str(i),W-50,60+50*i);
			stroke(255,255,255,50);
			noFill();
			ellipse(W-155,55+50*i,6,6);
		} else if (i<img1.selectNum) {
			text('Select Layer   ' + str(i),W-50,60+50*i);
			stroke(255,255,255,50);
			line(W-70,30+50*i,W-50,30+50*i);
			fill(selectionCols[(i-1)%selectionCols.length][0],selectionCols[(i-1)%selectionCols.length][1],selectionCols[(i-1)%selectionCols.length][2],150);
			noStroke();
			
			ellipse(W-155,55+50*i,6,6);
		} else if (i===img1.selectNum){
			text('Edited Image',W-50,60+50*i);
			stroke(255,255,255,50);
			line(W-70,30+50*i,W-50,30+50*i);
		}
	}
	
	stroke(255,255,255,150);
	line(W-70,H-60,W-50,H-60);
	line(W-60,H-70,W-60,H-50);
	
	if (mouseX<W-50 && mouseX>W-70 && mouseY>H-70 && mouseY<H-50){
		cursor('pointer');	
	}
}
function draw(){
	updateScreen();
}

function updateScreen(){
	hoverLayer = -1;
	cursor('default');
	background(25);	
	img1.drawLayer(selected);
// 	img1.drawOriginal();
	selections();
}


function mouseClicked(){
	img1.newSelection(mouseX,mouseY);
	if (hoverLayer>=0){
		selected = hoverLayer;
	}
	if (mouseX<W-50 && mouseX>W-70 && mouseY>H-70 && mouseY<H-50 && img1.selectNum<=9){
		img1.layers.push(createImage(img1.w,img1.h));
		img1.layers[img1.selectNum].copy(img1.modImgs[img1.history], 0, 0, img1.w, img1.h, 0, 0, img1.w, img1.h);
		img1.selectNum += 1;
		selected = img1.selectNum-1;
	}
}

function mouseDragged(){
	img1.newSelection(mouseX,mouseY);
}

function keyTyped() {
  if (keyIsDown(83)) {
    img1.modImgs[img1.history].save('tom_new', 'png');
  }
  if (keyIsDown(66)) {
  	img1.selectToCol([0,0,0],selected);
  }
  if (keyIsDown(32) && selected>0 && selected<=img1.selectNum) {
  	img1.clearLayer(selected);
  }
  if (keyIsDown(85)) {
    img1.undo();
  }
  if (keyIsDown(82)) {
    img1.redo();
  }
}

window.onresize = function() {
  resizeCanvas(windowWidth, windowHeight);
  W = windowWidth;
  H = windowHeight
};
