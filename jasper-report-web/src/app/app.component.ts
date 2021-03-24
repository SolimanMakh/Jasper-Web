import { Parser } from '@angular/compiler/src/ml_parser/parser';
import { Component, ElementRef, HostListener, Renderer2, ViewChild } from '@angular/core';
import {fabric} from "fabric"
import {Band} from "./band.model"

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'jasper-report-web';

  xhttp : XMLHttpRequest = new XMLHttpRequest();
  parser: DOMParser;
  xmlObj : XMLDocument;
  bands : Band[] = []
  bandChosen;

  /*@HostListener('keyup', ['$event'])
onClick(e) {
   console.log(e);
} */

  @ViewChild('canvas') canvas : ElementRef<HTMLCanvasElement>
 // CanvasContext :CanvasRenderingContext2D;
  canvasFabricRef: fabric.Canvas
  rect: fabric.Rect

  constructor(private renderer : Renderer2)
  {

  }

    ngOnInit()
    {
      this.parser = new DOMParser();


      this.xhttp.onreadystatechange = () => {
        if (this.xhttp.readyState == 4 && this.xhttp.status == 200) {
          this.xmlObj = this.xhttp.responseXML;

          console.log(this.xmlObj)
        }
    };
    this.xhttp.open("GET", "assets/jasper.jrxml", true);
    this.xhttp.send();


    for(var i = 0; i < 5; i++)
    {
      this.bands[i] = new Band("Test",100,20 + 100*i)
    }

    }

    ngAfterViewInit()
    {

    // this.CanvasContext = this.renderer.selectRootElement(this.canvas).nativeElement.getContext('2d');

    //this.CanvasContext.fillStyle = "red"
    // this.CanvasContext.fillRect(20,20,400,60);

    this.canvasFabricRef = new fabric.Canvas(this.canvas.nativeElement)
    const numberOfSquares = 800 / 20;
    for (var i = 0 ; i < numberOfSquares; i++)
    for (var j = 0 ; j < numberOfSquares; j++)
    {
     this.canvasFabricRef.add(new fabric.Rect({left: j * 20, top: 20 * i , stroke: "rgb(240,240,240)", opacity:0.5 ,fill:"transparent" ,width:20,height:20, strokeWidth:1 , selectable:false}));

    }

    const numberOfBSquares = 800/150

    for (var i = 0 ; i < numberOfBSquares; i++)
    for (var j = 0 ; j < numberOfBSquares; j++)
    {
     this.canvasFabricRef.add(new fabric.Rect({left: j * 150, top: 150 * i , stroke: "rgb(230,230,230)", opacity:0.5 ,fill:"transparent" ,width:150,height:150, strokeWidth:1 , selectable:false}));

    }



    console.log(this.bands)

    for (var i = 0 ; i < this.bands.length; i++)
    {
      this.bands[i].rect = new fabric.Rect({left: 0, top: this.bands[i].y , stroke: "blue" ,fill:"transparent" ,width:799,height:100, strokeWidth:1});
      this.bands[i].rect.lockMovementX = true;
      this.bands[i].rect.lockMovementY = true;
      this.bands[i].rect.hasControls = false;

      this.canvasFabricRef.add(this.bands[i].rect);
      var that = this


      this.bands[i].rect.on('selected',function (evt)
      {


        for (var j = 0 ; j < that.bands.length; j++)
        {

          that.bands[j].rect.set({stroke:"blue"})

          if(that.bands[j].rect === this)
            {that.bandChosen = j
              console.log(that.bandChosen)

            }

        }



        this.set({stroke:"black"})
        console.log(that);

      })


    }




    const text = new fabric.Text("Static!!!", {fontSize:20, left:350,top:30})

      this.canvasFabricRef.add(text);
      text.on('mouseup',evt =>
      {
        console.log(evt.transform.width)
      }
      )




this.canvasFabricRef.on('mouse:down', function(options: any) {
 // console.log(options.e.clientX, options.e.clientY);
});





    }

Expand()
{

      if (this.bandChosen === undefined)
        return;

      this.bands[this.bandChosen].rect.set({height: this.bands[this.bandChosen].rect.get('height') + 5});
      for (var i = this.bandChosen + 1 ; i < this.bands.length; i++)
      {

        this.bands[i].rect.set({top:this.bands[i].rect.get('top')+5})

      }

      this.canvasFabricRef.renderAll()

}

// Delete Band
deleteBand(evt: KeyboardEvent)
{

  //console.log(evt)
  this.canvasFabricRef.remove (this.bands[this.bandChosen].rect)

  for (var i = this.bandChosen + 1 ; i < this.bands.length; i++)
  {

    this.bands[i].rect.set({top:this.bands[i].rect.get('top') - this.bands[this.bandChosen].rect.get('height')})

  }

  this.bands.splice(this.bandChosen,1)


}



}
