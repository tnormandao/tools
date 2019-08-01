// base record function
function CanvasVideoRecorder( canvas, _resultRecordName, __format ) {
    
    const resultRecordName = _resultRecordName ||  'transition_record';
    const format = __format || 'webm'
    
    const chunks = [];
    const stream = canvas.captureStream();
    const recorder = new MediaRecorder(stream);
  
    recorder.ondataavailable = e => chunks.push(e.data);
      
      recorder.onstop = e => {
      
            // save recorded data 	
        const toExport = new Blob(chunks, { type: 'video/' + format } );
        
        console.log( 'toExport', toExport );
        
        const vid = document.createElement('video');
              vid.src = URL.createObjectURL( toExport );
              vid.controls = true;
              
        const a = document.createElement('a');
              a.download =  resultRecordName + '.' + format;
              a.href = vid.src;
              a.textContent = 'download the video';
              a.click();
        
      };
  
      // return record api for one recording 
      return {
        start: () => { recorder.start(); },
        stop: () => { recorder.stop() }
      };
      
  }
  
  
  class ShaderProgramm {
  
      constructor( processor, shaderConfig ){
          this.type = 'ShaderProgramm';
  
          console.log( processor, shaderConfig );
  
          this.processor = processor;
          this.shaderConfig = shaderConfig;
  
          this.uv = [ 0, 0 ];
          this.size = [ 0, 0 ];
  
          this.shaderFunction = this.shaderConfig.shader;
  
          this.uniforms = this.processor.uniforms;
          this.consts = this.processor.consts;
          this.varyings = this.processor.varyings;
  
          this.__textures = {};

      }

      getTexture( img ){
            if( !img.src ){ return null; }
            if( !img.isLoaded ){
                img.onload = (  ) => {
                    img.isLoaded = true;
                    this.getTexture( img );
                    return null;
                };
            }
            if( !img.complete ){ return null; }
            if( this.__textures[ img.src ] ){ return this.__textures[ img.src ] }
            this.__textures[ img.src ] = document.createElement( 'canvas' );
            this.__textures[ img.src ].width = img.width;
            this.__textures[ img.src ].height = img.height;
            this.__textures[ img.src ].ctx = this.__textures[ img.src ].getContext( '2d' );
            this.__textures[ img.src ].ctx.drawImage( img, 0, 0 );
            return this.__textures[ img.src ];
      }

      texture2D( img, UV ){
            let texture = this.getTexture( img );
            if( texture ) {
                return texture.ctx.getImageData( texture.width * UV[ 0 ], texture.height * UV[ 1 ], 1, 1 ).data;
            } else {
                return [ 0, 0, 0, 0 ];
            }
      }
  
      updateUV(){
          this.uv = this.processor.uv;
      }
  
      updateSize(){
          this.size = this.processor.size;
      }
  
      run(){
          this.updateUV();
          this.updateSize();
          return this.shaderFunction.call( this );
      }
  
  }
  
  class VertexShaderProgramm extends ShaderProgramm {
      constructor( processor, shaderConfig ){
          super( processor, shaderConfig );
          this.type = 'VertexShaderProgramm';
      }
  }
  
  class FragmentShaderProgramm extends ShaderProgramm {
      constructor( processor, shaderConfig ){
          super( processor, shaderConfig );
          this.type = 'FragmentShaderProgramm';
      }
  }
  
  class CanvasShaderProcessor{
  
      constructor( options ){
  
          this.initConfig = options;
  
          this.canvas = this.initConfig.canvas;
          this.ctx = this.canvas.getContext( '2d' );
              
          this.vertexShader = null;
          this.fragmentShader = null;
  
          this.uniforms = {};
          this.varyings = {};
          this.consts = {};
  
          this.uv = [ 0, 0 ];
          this.size = [ 0, 0 ];
          this.pixelSize = [ 0, 0 ];
  
          this.updateUV( 0, 0 );
          this.updateSize( this.canvas.width, this.canvas.height);
  
  
          if( this.initConfig.uniforms ){
              this.setUniforms( this.initConfig.uniforms );
          }
  
          if( this.initConfig.size ){
              this.updateSize( this.initConfig.size.width, this.initConfig.size.height);
          }
  
          if( this.initConfig.vertexShader ){
              this.vertexShader__( this.initConfig.vertexShader );
          }
  
          if( this.initConfig.fragmentShader ){
              this.fragmentShader__( this.initConfig.fragmentShader );
          }
  
      }
  
      setVaryings( varyingsAsObject, clearFlag ){
          if( clearFlag ){ this.varyings = {}; }
          for( const nextKey in varyingsAsObject ){
              this.varyings[ nextKey ] = varyingsAsObject[ nextKey ];
          }
      }
  
      setUniforms( uniformsAsObject, clearFlag ){
          if( clearFlag ){ this.uniforms = {}; }
          for( const nextKey in uniformsAsObject ){
              this.uniforms[ nextKey ] = uniformsAsObject[ nextKey ];
          }
      }
  
      vertexShader__( vertexShader ){
          this.setVaryings( vertexShader.varyings );
          this.vertexShader = new VertexShaderProgramm( this, vertexShader );
          return this;
      }
  
      fragmentShader__( fragmentShader ){
          this.setVaryings( fragmentShader.varyings );
          this.fragmentShader = new FragmentShaderProgramm( this, fragmentShader );
          return this;
      }
  
      updatePixelSize(){
          this.pixelSize = [ 
              this.canvas.width / this.size[ 0 ], 
              this.canvas.height / this.size[ 1 ]
          ];
      }
  
      updateSize( _x, _y ){
          const x = _x || this.canvas.witdh;
          const Y = _y || this.canvas.height;
          this.size = [ x, Y ];
          this.updatePixelSize();
      }
  

      updateUV( x, y ){
          this.uv = [ 
              x / this.size[ 0 ], 
              y / this.size[ 1 ] 
            ];
      }
  
      // [ x, y ]
      render( x, y ){ 
  
          this.updateUV( x, y );
  
          let PIXEL_COLOR = [ 0, 0, 0, 255 ];
  
          if( this.vertexShader ){
              this.vertexShader.run();
          }
  
          if( this.fragmentShader ){
              PIXEL_COLOR = this.fragmentShader.run();
          }
          
          const nextX =  ( x * this.pixelSize[ 0 ]  ) - this.pixelSize[ 0 ] * 0.5;
          const nextY =  ( y * this.pixelSize[ 0 ]  ) - this.pixelSize[ 1 ] * 0.5;

          this.ctx.fillStyle = 'rgba(' + PIXEL_COLOR.join(',') + ')';
          this.ctx.fillRect( nextX - this.pixelSize[ 0 ] * 0.5, nextY - this.pixelSize[ 1 ] * 0.5, this.pixelSize[ 0 ], this.pixelSize[ 1 ] );
  
      }
    
  }
  

  


// demo scripts
const can = document.getElementById( 'testCanvas' );
can.width = 320;
can.height = 240;
const ctx = can.getContext( '2d' );
ctx.fillStyle = '#ff0000';
let nextYPosition = 0;
let testPosition = 0;
let lastPosition = 0;
let lineHeight = 1;
/* let lineGeight = can.height/80; */

let record_name = 'test_record';
let record_ext = 'webm';
let recordIsActive = false;
let recorder = null;

const recordName_i = document.getElementById( 'recordName' );
recordName_i.addEventListener( 'input', ( e ) => {
	record_name = e.target.value;
} );

const recordButton = document.getElementById( 'record' );
recordButton.style.backgroundColor = '#dddddd';
recordButton.addEventListener( 'click', () => {
	if( recordIsActive ){
 	 	recordButton.innerText = 'record';
 	 	recordButton.style.backgroundColor = '#dddddd';
    recordIsActive = false;
    recorder.stop();
    recorder = null;
  } else {
 	 	recordButton.innerText = 'stop';
 	 	recordButton.style.backgroundColor = '#ffdddd';
    recordIsActive = true;
  	recorder = CanvasVideoRecorder( can, record_name, record_ext );
    recorder.start();
  }
} );

const nextImage = new Image();

console.log( { nextImage } );

const testCanvasShader = new CanvasShaderProcessor( {
    canvas: can,
    uniforms: {
        time: 0,
        texture: nextImage
    },
    fragmentShader: {
        varyings: {
            testPixel: [ 0, 2 ]
        },
        shader: function() {

            const uv = this.uv;
            const size = this.size;
            const time = this.uniforms.time;
            
            const testPixel = this.varyings.testPixel;

            const RGBA_OUT = [ 0, 0, 0, 255 ];
            
            const colorFactor = 333;
            const sizeFactor = 0.01;
            
            const uvFactor = 23.3;
            
            const widthFrames = 3315;
            const heightFrames = 3315;
            
            const timeAlpha = 0.5 + Math.sin( time * sizeFactor * Math.PI ) * 0.5;
            
            let framedUV = [
            		( uv[0] * widthFrames ) % 1,
            		( uv[1] * heightFrames ) % 1,
            ];
            
            framedUV = uv;

            const R_Color = 0.5 + Math.sin(
            	Math.sin( framedUV[0] * 1.3 * timeAlpha + time * 0.01 ) * Math.PI
            ) * 0.5;
            
            const B_Color = 0.5 + Math.cos(
            	Math.cos( framedUV[1] * 1.3 * timeAlpha ) * Math.PI
            ) * 0.5;
            
            const G_Color = 0.5 + Math.cos(
            	Math.sin(  ( R_Color + B_Color ) * timeAlpha ) * Math.PI
            ) * 0.5;
            
            const textureRGBA = this.texture2D( this.uniforms.texture, [
            	R_Color, 
              B_Color
            ] );
            
            RGBA_OUT[ 0 ] = Math.floor( ( R_Color + textureRGBA[ 0 ] / 255 ) * 255 * 0.5 );
            RGBA_OUT[ 1 ] = Math.floor( ( G_Color + textureRGBA[ 1 ] / 255 ) * 255 * 0.5 );
            RGBA_OUT[ 2 ] = Math.floor( ( B_Color + textureRGBA[ 2 ] / 255 ) * 255 * 0.5 );

 						// return RGBA_OUT;
            return textureRGBA;

        }
    }
} );

nextImage.crossOrigin = '*';
nextImage.src = 'https://picsum.photos/200/300/';

testCanvasShader.updateSize(
	 Math.floor( can.width * 0.35 ),
	 Math.floor( can.height * 0.35 )
);

let positionsPreFrame = 1300;
let XX = 0;
let YY = 0;

console.log( ctx.getImageData( 50, 50, 1, 1 ) );

const animator = () => {

		const intervalFactor = 0.3;

		testCanvasShader.uniforms.time ++;

		for( let i = 0; i < testCanvasShader.size[ 0 ] * testCanvasShader.size[ 1 ]; i++ ){
   
	    testCanvasShader.render( XX, YY );
      
			/* */       
			if( XX == testCanvasShader.size[ 0 ] ){
        YY++;
      }
      
      if( XX <= testCanvasShader.size[ 0 ] ){
        XX++;
      } else {
        XX = 0;
      }
        
      if( YY === testCanvasShader.size[ 1 ] ){
        YY = 0;
      }
      
    }

    requestAnimationFrame( animator );
};
animator();
