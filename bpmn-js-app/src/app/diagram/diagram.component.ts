import {
  AfterContentInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  SimpleChanges,
  EventEmitter
} from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { map, switchMap } from 'rxjs/operators';
import { NgEventBus } from 'ng-event-bus';
import type Canvas from 'diagram-js/lib/core/Canvas';
import type { ImportDoneEvent, ImportXMLResult } from 'bpmn-js';

/**
 * You may include a different variant of BpmnJS:
 *
 * bpmn-viewer  - displays BPMN diagrams without the ability
 *                to navigate them
 * bpmn-modeler - bootstraps a full-fledged BPMN editor
 */
import BpmnJS from 'bpmn-js/lib/Modeler';


import { from, Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-diagram',
  template: `
  <button kendoButton style="vertical-align: top;" (click)="SaveXML();">SaveXML</button> 
  <button kendoButton style="vertical-align: top;" (click)="introduction();">introduction</button> 
  <div #ref class="diagram-container"></div>
   
  `,
  styles: [
    `
      .diagram-container {
        height: 100%;
        width: 100%;
      }
    `
  ]
})
export class DiagramComponent implements AfterContentInit, OnChanges, OnDestroy, OnInit {

  @ViewChild('ref', { static: true }) private el: ElementRef;
  @Input() private url?: string;
  @Output() private importDone: EventEmitter<ImportDoneEvent> = new EventEmitter();
  private bpmnJS: BpmnJS = new BpmnJS();
  public eventBus;
  
  //public diagramXML = import('./diagram.bpmn');

  constructor(private http: HttpClient) {
    this.bpmnJS.on<ImportDoneEvent>('import.done', ({ error }) => {
      if (!error) {
        this.bpmnJS.get<Canvas>('canvas').zoom('fit-viewport');
         this.eventBus = this.bpmnJS.get('eventBus');
        // console.log ('eventBus:', this.eventBus);
         this.interaction( this, this.eventBus);
      }
    });
  }

  ngAfterContentInit(): void {
    this.bpmnJS.attachTo(this.el.nativeElement);
    
  }

  ngOnInit(): void {
    //console.log("url:", this.url); //url: https://cdn.statically.io/gh/bpmn-io/bpmn-js-examples/dfceecba/starter/diagram.bpmn
    if (this.url) {
      
      //this.importDiagram(this.myXml);
      this.loadUrl(this.url);
      //this.introduction();

    
    }
  }
  
  
  ngOnChanges(changes: SimpleChanges) {
    // re-import whenever the url changes
   
    if (changes.url) {
      //this.importDiagram(this.myXml);
      //this.loadUrl(changes.url.currentValue);
    }
  }

  ngOnDestroy(): void {
    this.bpmnJS.destroy();
  }

  /**
   * Load diagram from URL and emit completion event
   */
  loadUrl(url: string): Subscription {

    return (
      this.http.get(url, { responseType: 'text' }).pipe(
        switchMap((xml: string) => this.importDiagram(xml)),
        map(result => result.warnings),
      ).subscribe(
        (warnings) => {
          //console.log("here:warnings:",warnings);
           this.importDone.emit({
            type: 'success',
            warnings
          });
        },
        (err) => {
          this.importDone.emit({
            type: 'error',
            error: err
          });
        }
      )
    );
  }

  /**
   * Creates a Promise to import the given XML into the current
   * BpmnJS instance, then returns it as an Observable.
   *
   * @see https://github.com/bpmn-io/bpmn-js-callbacks-to-promises#importxml
   */
  private importDiagram(xml: string): Observable<ImportXMLResult> {
   // console.log("starting importDiagram")
   
    return from(this.bpmnJS.importXML(xml));
  }
  getJson() {
    let xml = this.bpmnJS.saveXML({ format: true }) 
     // console.log("xml:",xml);
    
  }
  public interaction(object, eventBus){
    console.log("eventBus:",eventBus);
          // you may hook into any of the following events
          var events = [
            // 'element.hover',
            // 'element.out',
            'element.click',
             'element.dblclick',
            // 'element.mousedown',
            // 'element.mouseup'
          ];
          
          events.forEach(function(event) {
         
            eventBus.on(event, function(e) {
              // e.element = the model element
              // e.gfx = the graphical element
              // console.log(event, 'on', e.element.id);
              console.log(event, 'on', e);
              let masterparam=[
                {
                event:event,
                e:e
                }
              ]
              object.handleEvent.apply(object, masterparam)
            });
          });
  }
  public handleEvent(e){
    console.log( 'on', e);
    console.log( 'on2', this.eventBus);
  }

  async SaveXML(){
    let  savedXML;
    savedXML = await this.bpmnJS.saveXML({ format: true }) 
    console.log("here:savedXML:",savedXML.xml);
    // var encodedData = encodeURIComponent(savedXML.xml);
    // console.log("here:encodedData:",encodedData);


  }
  public diagramXML=
'<?xml version="1.0" encoding="UTF-8"?>'
+'<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn" exporter="Camunda Modeler" exporterVersion="4.1.0" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd">'
  +'<bpmn2:process id="Process_1" isExecutable="false">'
    +'<bpmn2:startEvent id="StartEvent_1" name="StartEvent_1" />'
  +'</bpmn2:process>'
  +'<bpmndi:BPMNDiagram id="BPMNDiagram_1">'
    +'<bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">'
      +'<bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">'
        +'<dc:Bounds x="182" y="82" width="36" height="36" />'
        +'<bpmndi:BPMNLabel>'
          +'<dc:Bounds x="168" y="125" width="64" height="14" />'
        +'</bpmndi:BPMNLabel>'
      +'</bpmndi:BPMNShape>'
    +'</bpmndi:BPMNPlane>'
  +'</bpmndi:BPMNDiagram>'
+'</bpmn2:definitions>';

  public myXml=
   '<?xml version="1.0" encoding="UTF-8"?>'
  + '<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC" xmlns:omgdi="http://www.omg.org/spec/DD/20100524/DI" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" targetNamespace="" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL http://www.omg.org/spec/BPMN/2.0/20100501/BPMN20.xsd">'
    + '<collaboration id="sid-c0e745ff-361e-4afb-8c8d-2a1fc32b1424">'
      + '<participant id="sid-87F4C1D6-25E1-4A45-9DA7-AD945993D06F" name="Customer" processRef="sid-C3803939-0872-457F-8336-EAE484DC4A04" />'
    + '</collaboration>'
    + '<process id="sid-C3803939-0872-457F-8336-EAE484DC4A04" name="Customer" processType="None" isClosed="false" isExecutable="false">'
      + '<extensionElements />'
      + '<laneSet id="sid-b167d0d7-e761-4636-9200-76b7f0e8e83a">'
        + '<lane id="sid-57E4FE0D-18E4-478D-BC5D-B15164E93254">'
          + '<flowNodeRef>sid-52EB1772-F36E-433E-8F5B-D5DFD26E6F26</flowNodeRef>'
          + '<flowNodeRef>sid-D7F237E8-56D0-4283-A3CE-4F0EFE446138</flowNodeRef>'
          + '<flowNodeRef>sid-E433566C-2289-4BEB-A19C-1697048900D2</flowNodeRef>'
        + '</lane>'
      + '</laneSet>'
      + '<task id="sid-52EB1772-F36E-433E-8F5B-D5DFD26E6F26" name="Scan QR code">'
        + '<incoming>Flow_1sh3to1</incoming>'
        + '<outgoing>sid-EE8A7BA0-5D66-4F8B-80E3-CC2751B3856A</outgoing>'
      + '</task>'
      + '<startEvent id="sid-D7F237E8-56D0-4283-A3CE-4F0EFE446138" name="Notices&#10;QR code">'
        + '<outgoing>Flow_1sh3to1</outgoing>'
      + '</startEvent>'
      + '<sequenceFlow id="sid-EE8A7BA0-5D66-4F8B-80E3-CC2751B3856A" sourceRef="sid-52EB1772-F36E-433E-8F5B-D5DFD26E6F26" targetRef="sid-E433566C-2289-4BEB-A19C-1697048900D2" />'
      + '<sequenceFlow id="Flow_1sh3to1" sourceRef="sid-D7F237E8-56D0-4283-A3CE-4F0EFE446138" targetRef="sid-52EB1772-F36E-433E-8F5B-D5DFD26E6F26" />'
      + '<endEvent id="sid-E433566C-2289-4BEB-A19C-1697048900D2" name="Is informed">'
        + '<incoming>sid-EE8A7BA0-5D66-4F8B-80E3-CC2751B3856A</incoming>'
      + '</endEvent>'
    + '</process>'
    + '<bpmndi:BPMNDiagram id="sid-74620812-92c4-44e5-949c-aa47393d3830">'
      + '<bpmndi:BPMNPlane id="sid-cdcae759-2af7-4a6d-bd02-53f3352a731d" bpmnElement="sid-c0e745ff-361e-4afb-8c8d-2a1fc32b1424">'
        + '<bpmndi:BPMNShape id="sid-87F4C1D6-25E1-4A45-9DA7-AD945993D06F_gui" bpmnElement="sid-87F4C1D6-25E1-4A45-9DA7-AD945993D06F" isHorizontal="true">'
          + '<omgdc:Bounds x="83" y="105" width="933" height="250" />'
          + '<bpmndi:BPMNLabel labelStyle="sid-84cb49fd-2f7c-44fb-8950-83c3fa153d3b">'
            + '<omgdc:Bounds x="47.49999999999999" y="170.42857360839844" width="12.000000000000014" height="59.142852783203125" />'
          + '</bpmndi:BPMNLabel>'
        + '</bpmndi:BPMNShape>'
        + '<bpmndi:BPMNShape id="sid-57E4FE0D-18E4-478D-BC5D-B15164E93254_gui" bpmnElement="sid-57E4FE0D-18E4-478D-BC5D-B15164E93254" isHorizontal="true">'
          + '<omgdc:Bounds x="113" y="105" width="903" height="250" />'
        + '</bpmndi:BPMNShape>'
        + '<bpmndi:BPMNShape id="sid-52EB1772-F36E-433E-8F5B-D5DFD26E6F26_gui" bpmnElement="sid-52EB1772-F36E-433E-8F5B-D5DFD26E6F26">'
          + '<omgdc:Bounds x="393" y="170" width="100" height="80" />'
          + '<bpmndi:BPMNLabel labelStyle="sid-84cb49fd-2f7c-44fb-8950-83c3fa153d3b">'
            + '<omgdc:Bounds x="360.5" y="172" width="84" height="12" />'
          + '</bpmndi:BPMNLabel>'
        + '</bpmndi:BPMNShape>'
        + '<bpmndi:BPMNShape id="StartEvent_0l6sgn0_di" bpmnElement="sid-D7F237E8-56D0-4283-A3CE-4F0EFE446138">'
          + '<omgdc:Bounds x="187" y="192" width="36" height="36" />'
          + '<bpmndi:BPMNLabel>'
            + '<omgdc:Bounds x="182" y="229" width="46" height="24" />'
          + '</bpmndi:BPMNLabel>'
        + '</bpmndi:BPMNShape>'
        + '<bpmndi:BPMNShape id="EndEvent_0xwuvv5_di" bpmnElement="sid-E433566C-2289-4BEB-A19C-1697048900D2">'
          + '<omgdc:Bounds x="612" y="192" width="36" height="36" />'
          + '<bpmndi:BPMNLabel>'
            + '<omgdc:Bounds x="604" y="231" width="55" height="14" />'
          + '</bpmndi:BPMNLabel>'
        + '</bpmndi:BPMNShape>'
        + '<bpmndi:BPMNEdge id="sid-EE8A7BA0-5D66-4F8B-80E3-CC2751B3856A_gui" bpmnElement="sid-EE8A7BA0-5D66-4F8B-80E3-CC2751B3856A">'
          + '<omgdi:waypoint x="493" y="210" />'
          + '<omgdi:waypoint x="612" y="210" />'
          + '<bpmndi:BPMNLabel>'
            + '<omgdc:Bounds x="494" y="185" width="90" height="20" />'
          + '</bpmndi:BPMNLabel>'
        + '</bpmndi:BPMNEdge>'
        + '<bpmndi:BPMNEdge id="Flow_1sh3to1_di" bpmnElement="Flow_1sh3to1">'
          + '<omgdi:waypoint x="223" y="210" />'
          + '<omgdi:waypoint x="393" y="210" />'
        + '</bpmndi:BPMNEdge>'
      + '</bpmndi:BPMNPlane>'
      + '<bpmndi:BPMNLabelStyle id="sid-e0502d32-f8d1-41cf-9c4a-cbb49fecf581">'
        + '<omgdc:Font name="Arial" size="11" isBold="false" isItalic="false" isUnderline="false" isStrikeThrough="false" />'
      + '</bpmndi:BPMNLabelStyle>'
      + '<bpmndi:BPMNLabelStyle id="sid-84cb49fd-2f7c-44fb-8950-83c3fa153d3b">'
        + '<omgdc:Font name="Arial" size="12" isBold="false" isItalic="false" isUnderline="false" isStrikeThrough="false" />'
      + '</bpmndi:BPMNLabelStyle>'
    + '</bpmndi:BPMNDiagram>'
  + '</definitions>';
  public elementFactory;
  public elementRegistry;
  public modeling;
  async  introduction(){
    await this.importDiagram(this.diagramXML);
// (1) Get the modules
console.log("here1")
this.elementFactory = this.bpmnJS.get('elementFactory'),
console.log("here2")
this.elementRegistry = this.bpmnJS.get('elementRegistry'),
console.log("here3")
this.modeling = this.bpmnJS.get('modeling');
console.log("here4")
// (2) Get the existing process and the start event
const process = this.elementRegistry.get('Process_1'),
startEvent = this.elementRegistry.get('StartEvent_1');
console.log("here5:this.process:",  process)
// (3) Create a new diagram shape
const task = this.elementFactory.createShape({ type: 'bpmn:Task' });
console.log("here6:this.task :", task )
// (4) Add the new task to the diagram
this.modeling.createShape(task, { x: 400, y: 100 }, process);
console.log("here7")
// You can now access the new task through the element registry
console.log(this.elementRegistry.get(task.id)); // Shape { "type": "bpmn:Task", ... }

// (5) Connect the existing start event to new task
this.modeling.connect(startEvent, task);

  }
}

