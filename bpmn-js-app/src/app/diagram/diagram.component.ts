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
import BpmnModeler from 'bpmn-js/lib/Modeler';
import customTranslate from '../customTranslate/customTranslate';
/**
 * You may include a different variant of BpmnJS:
 *
 * bpmn-viewer  - displays BPMN diagrams without the ability
 *                to navigate them
 * bpmn-modeler - bootstraps a full-fledged BPMN editor
 */


import BpmnJSM from 'bpmn-js/lib/Modeler';
import BpmnJSV from 'bpmn-js/lib/Viewer';


import { from, Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-diagram',
  template: `
  
  <button kendoButton style="vertical-align: top;" (click)="SaveXML();">Both:SaveXML</button> 
  <button kendoButton style="vertical-align: top;" (click)="introduction();">Mod:introduction</button> 
  <button kendoButton style="vertical-align: top;" (click)="BusinessObjects();">Mod:BusinessObjects</button> 
  <button kendoButton style="vertical-align: top;" (click)="creatingShapes();">Mod:creatingShapes</button> 
  <button kendoButton style="vertical-align: top;" (click)="connectingShapes();">Mod:connectingShapes</button> 
  <button kendoButton style="vertical-align: top;" (click)="collaborations();">Mod:collaborations</button> 
  <button kendoButton style="vertical-align: top;" (click)="editElements();">:Mod:editElements</button> 
  <button kendoButton style="vertical-align: top;" (click)="editElements2();">Mod:editElements2</button> 
  <button kendoButton style="vertical-align: top;" (click)="colorElements();">Mod:colorElements</button> 
  
  
  

  <div  #ref class="diagram-container" ></div>

  `,

  styles: [

    ` 
    .highlightx {
      background-color: #b2f699;
    }
 

      .highlight:not(.djs-connection) .djs-visual > :nth-child(1) {
      fill: green !important; /* color elements as green */
    }

    .highlight-overlay {
      background-color: green; /* color elements as green */
      opacity: 0.4;
      pointer-events: none; /* no pointer events, allows clicking through onto the element */
      border-radius: 10px;
    }

    .green  {
      background-color: #b2f699;
      color: #b2f699;
      fill: #b2f699!importan;
    }
      .diagram-container {
        height: 100%;
        width: 100%;
      }
    `
  ]
})
export class DiagramComponent implements AfterContentInit, OnChanges, OnDestroy, OnInit {
  public useModeler = false
  public showDig = true

  @ViewChild('ref', { static: true }) private el: ElementRef;
  @Input() private url?: string;
  @Output() private importDone: EventEmitter<ImportDoneEvent> = new EventEmitter();
  public bpmnJS: BpmnJSV;
  public bpmnJSV: BpmnJSV = new BpmnJSV();
  public bpmnJSM: BpmnJSM = new BpmnJSM();
  
//  public customTranslateModule = {
//     translate: [ 'value', customTranslate ]
//   };
//   public bpmnJS = new BpmnModeler({
// publiccontainer: '#canvas',
//     additionalModules: [
//       this.customTranslateModule
//     ]
//   });

  public eventBus;
  
  //public diagramXML = import('./diagram.bpmn');

  constructor(private http: HttpClient) {
    if (this.useModeler)
      this.bpmnJS =  this.bpmnJSM;
    else
      this.bpmnJS =  this.bpmnJSV;
    this.bpmnJS.on<ImportDoneEvent>('import.done', ({ error }) => {
      if (!error) {
        this.bpmnJS.get<Canvas>('canvas').zoom('fit-viewport');
        this.eventBus = this.bpmnJS.get('eventBus');
        // console.log ('eventBus:', this.eventBus);
        this.interaction(this, this.eventBus);
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
  public interaction(object, eventBus) {
    console.log("eventBus:", eventBus);
    // you may hook into any of the following events
    var events = [
      // 'element.hover',
      // 'element.out',
      'element.click',
      'element.dblclick',
      // 'element.mousedown',
      // 'element.mouseup'
    ];

    events.forEach(function (event) {

      eventBus.on(event, function (e) {
        // e.element = the model element
        // e.gfx = the graphical element
        // console.log(event, 'on', e.element.id);
        console.log(event, 'on', e);
        let masterparam = [
          {
            event: event,
            e: e
          }
        ]
        object.handleEvent.apply(object, masterparam)
      });
    });
  }
  public handleEvent(e) {
    console.log('on', e);
    console.log('on2', this.eventBus);
  }

  async SaveXML() {
    let savedXML;
    savedXML = await this.bpmnJS.saveXML({ format: true })
    console.log("here:savedXML:", savedXML.xml);
    // var encodedData = encodeURIComponent(savedXML.xml);
    // console.log("here:encodedData:",encodedData);


  }
  public diagramXML =
    '<?xml version="1.0" encoding="UTF-8"?>'
    + '<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn" exporter="Camunda Modeler" exporterVersion="4.1.0" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd">'
    + '<bpmn2:process id="Process_1" isExecutable="false">'
    + '<bpmn2:startEvent id="StartEvent_1" name="StartEvent_1" />'
    + '</bpmn2:process>'
    + '<bpmndi:BPMNDiagram id="BPMNDiagram_1">'
    + '<bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">'
    + '<bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">'
    + '<dc:Bounds x="182" y="82" width="36" height="36" />'
    + '<bpmndi:BPMNLabel>'
    + '<dc:Bounds x="168" y="125" width="64" height="14" />'
    + '</bpmndi:BPMNLabel>'
    + '</bpmndi:BPMNShape>'
    + '</bpmndi:BPMNPlane>'
    + '</bpmndi:BPMNDiagram>'
    + '</bpmn2:definitions>';

  public myXml =
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

  public editingElemtns =
    +'<?xml version="1.0" encoding="UTF-8"?>'
    + '<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn" exporter="Camunda Modeler" exporterVersion="4.1.0" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd">'
    + '<bpmn2:process id="Process_1" isExecutable="false">'
    + '<bpmn2:startEvent id="StartEvent_1" name="StartEvent_1">'
    + '<bpmn2:outgoing>SequenceFlow_1``+</bpmn2:outgoing>'
    + '</bpmn2:startEvent>'
    + '<bpmn2:task id="Task_1" name="Task_1">'
    + '<bpmn2:incoming>SequenceFlow_1+</bpmn2:incoming>'
    + '<bpmn2:outgoing>SequenceFlow_2+</bpmn2:outgoing>'
    + '</bpmn2:task>'
    + '<bpmn2:sequenceFlow id="SequenceFlow_1" name="SequenceFlow_1" sourceRef="StartEvent_1" targetRef="Task_1" />'
    + '<bpmn2:exclusiveGateway id="ExclusiveGateway_1" name="ExclusiveGateway_1">'
    + '<bpmn2:incoming>SequenceFlow_2+</bpmn2:incoming>'
    + '<bpmn2:outgoing>SequenceFlow_3+</bpmn2:outgoing>'
    + '<bpmn2:outgoing>SequenceFlow_5+</bpmn2:outgoing>'
    + '</bpmn2:exclusiveGateway>'
    + '<bpmn2:sequenceFlow id="SequenceFlow_2" name="SequenceFlow_2" sourceRef="Task_1" targetRef="ExclusiveGateway_1" />'
    + '<bpmn2:task id="Task_2" name="Task_2">'
    + '<bpmn2:incoming>SequenceFlow_3+</bpmn2:incoming>'
    + '<bpmn2:outgoing>SequenceFlow_4+</bpmn2:outgoing>'
    + '</bpmn2:task>'
    + '<bpmn2:sequenceFlow id="SequenceFlow_3" name="SequenceFlow_3" sourceRef="ExclusiveGateway_1" targetRef="Task_2" />'
    + '<bpmn2:task id="Task_3" name="Task_3">'
    + '<bpmn2:incoming>SequenceFlow_5+</bpmn2:incoming>'
    + '<bpmn2:outgoing>SequenceFlow_6+</bpmn2:outgoing>'
    + '</bpmn2:task>'
    + '<bpmn2:sequenceFlow id="SequenceFlow_5" name="SequenceFlow_5" sourceRef="ExclusiveGateway_1" targetRef="Task_3" />'
    + '<bpmn2:exclusiveGateway id="ExclusiveGateway_2">'
    + '<bpmn2:incoming>SequenceFlow_4+</bpmn2:incoming>'
    + '<bpmn2:incoming>SequenceFlow_6+</bpmn2:incoming>'
    + '<bpmn2:outgoing>SequenceFlow_7+</bpmn2:outgoing>'
    + '</bpmn2:exclusiveGateway>'
    + '<bpmn2:sequenceFlow id="SequenceFlow_4" name="SequenceFlow_4" sourceRef="Task_2" targetRef="ExclusiveGateway_2" />'
    + '<bpmn2:sequenceFlow id="SequenceFlow_6" name="SequenceFlow_6" sourceRef="Task_3" targetRef="ExclusiveGateway_2" />'
    + '<bpmn2:endEvent id="EndEvent_1" name="EndEvent_1">'
    + '<bpmn2:incoming>SequenceFlow_7+</bpmn2:incoming>'
    + '</bpmn2:endEvent>'
    + '<bpmn2:sequenceFlow id="SequenceFlow_7" name="SequenceFlow_7" sourceRef="ExclusiveGateway_2" targetRef="EndEvent_1" />'
    + '</bpmn2:process>'
    + '<bpmndi:BPMNDiagram id="BPMNDiagram_1">'
    + '<bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">'
    + '<bpmndi:BPMNEdge id="SequenceFlow_15sa8ce_di" bpmnElement="SequenceFlow_7">'
    + '<di:waypoint x="735" y="100" />'
    + '<di:waypoint x="792" y="100" />'
    + '<bpmndi:BPMNLabel>'
    + '<dc:Bounds x="746" y="82" width="36" height="14" />'
    + '</bpmndi:BPMNLabel>'
    + '</bpmndi:BPMNEdge>'
    + '<bpmndi:BPMNEdge id="SequenceFlow_1smsur8_di" bpmnElement="SequenceFlow_6">'
    + '<di:waypoint x="630" y="210" />'
    + '<di:waypoint x="710" y="210" />'
    + '<di:waypoint x="710" y="125" />'
    + '<bpmndi:BPMNLabel>'
    + '<dc:Bounds x="652" y="192" width="36" height="14" />'
    + '</bpmndi:BPMNLabel>'
    + '</bpmndi:BPMNEdge>'
    + '<bpmndi:BPMNEdge id="SequenceFlow_1hte2hf_di" bpmnElement="SequenceFlow_4">'
    + '<di:waypoint x="630" y="100" />'
    + '<di:waypoint x="685" y="100" />'
    + '<bpmndi:BPMNLabel>'
    + '<dc:Bounds x="640" y="82" width="36" height="14" />'
    + '</bpmndi:BPMNLabel>'
    + '</bpmndi:BPMNEdge>'
    + '<bpmndi:BPMNEdge id="SequenceFlow_0aq08pb_di" bpmnElement="SequenceFlow_5">'
    + '<di:waypoint x="450" y="125" />'
    + '<di:waypoint x="450" y="210" />'
    + '<di:waypoint x="530" y="210" />'
    + '<bpmndi:BPMNLabel>'
    + '<dc:Bounds x="447" y="165" width="36" height="14" />'
    + '</bpmndi:BPMNLabel>'
    + '</bpmndi:BPMNEdge>'
    + '<bpmndi:BPMNEdge id="SequenceFlow_02a2l5d_di" bpmnElement="SequenceFlow_3">'
    + '<di:waypoint x="475" y="100" />'
    + '<di:waypoint x="530" y="100" />'
    + '<bpmndi:BPMNLabel>'
    + '<dc:Bounds x="460" y="82" width="86" height="14" />'
    + '</bpmndi:BPMNLabel>'
    + '</bpmndi:BPMNEdge>'
    + '<bpmndi:BPMNEdge id="SequenceFlow_1w4gozt_di" bpmnElement="SequenceFlow_2">'
    + '<di:waypoint x="370" y="100" />'
    + '<di:waypoint x="425" y="100" />'
    + '<bpmndi:BPMNLabel>'
    + '<dc:Bounds x="380" y="82" width="36" height="14" />'
    + '</bpmndi:BPMNLabel>'
    + '</bpmndi:BPMNEdge>'
    + '<bpmndi:BPMNEdge id="SequenceFlow_1ryok29_di" bpmnElement="SequenceFlow_1">'
    + '<di:waypoint x="218" y="100" />'
    + '<di:waypoint x="270" y="100" />'
    + '<bpmndi:BPMNLabel>'
    + '<dc:Bounds x="226" y="82" width="36" height="14" />'
    + '</bpmndi:BPMNLabel>'
    + '</bpmndi:BPMNEdge>'
    + '<bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">'
    + '<dc:Bounds x="182" y="82" width="36" height="36" />'
    + '<bpmndi:BPMNLabel>'
    + '<dc:Bounds x="168" y="125" width="64" height="14" />'
    + '</bpmndi:BPMNLabel>'
    + '</bpmndi:BPMNShape>'
    + '<bpmndi:BPMNShape id="Task_12zzrms_di" bpmnElement="Task_1">'
    + '<dc:Bounds x="270" y="60" width="100" height="80" />'
    + '</bpmndi:BPMNShape>'
    + '<bpmndi:BPMNShape id="ExclusiveGateway_11f201q_di" bpmnElement="ExclusiveGateway_1" isMarkerVisible="true">'
    + '<dc:Bounds x="425" y="75" width="50" height="50" />'
    + '<bpmndi:BPMNLabel>'
    + '<dc:Bounds x="422" y="45" width="56" height="14" />'
    + '</bpmndi:BPMNLabel>'
    + '</bpmndi:BPMNShape>'
    + '<bpmndi:BPMNShape id="Task_0w550ac_di" bpmnElement="Task_2">'
    + '<dc:Bounds x="530" y="60" width="100" height="80" />'
    + '</bpmndi:BPMNShape>'
    + '<bpmndi:BPMNShape id="Task_16o7rq6_di" bpmnElement="Task_3">'
    + '<dc:Bounds x="530" y="170" width="100" height="80" />'
    + '</bpmndi:BPMNShape>'
    + '<bpmndi:BPMNShape id="ExclusiveGateway_1kr4wam_di" bpmnElement="ExclusiveGateway_2" isMarkerVisible="true">'
    + '<dc:Bounds x="685" y="75" width="50" height="50" />'
    + '</bpmndi:BPMNShape>'
    + '<bpmndi:BPMNShape id="Event_0wya6az_di" bpmnElement="EndEvent_1">'
    + '<dc:Bounds x="792" y="82" width="36" height="36" />'
    + '<bpmndi:BPMNLabel>'
    + '<dc:Bounds x="780" y="125" width="60" height="14" />'
    + '</bpmndi:BPMNLabel>'
    + '</bpmndi:BPMNShape>'
    + '</bpmndi:BPMNPlane>'
    + '</bpmndi:BPMNDiagram>'
    + '</bpmn2:definitions>';

  public elementFactory;
  public elementRegistry;
  public modeling;

  async introduction() {
    await this.importDiagram(this.diagramXML);


    // (1) Get the modules
    console.log("here1")
    this.elementFactory = this.bpmnJS.get('elementFactory'),
      console.log("here2:this.elementFactory:", this.elementFactory)
    this.elementRegistry = this.bpmnJS.get('elementRegistry'),
      console.log("here3:this.elementRegistry:", this.elementRegistry)
    this.modeling = this.bpmnJS.get('modeling');
    
    console.log("here4")
    // (2) Get the existing process and the start event
    const process = this.elementRegistry.get('Process_1'),
      startEvent = this.elementRegistry.get('StartEvent_1');
    console.log("here5:this.process:", process)
    // (3) Create a new diagram shape
    const task = this.elementFactory.createShape({ type: 'bpmn:Task' });
    console.log("here6:this.task :", task)
    // (4) Add the new task to the diagram
    this.modeling.createShape(task, { x: 400, y: 100 }, process);
    console.log("here7")
    // You can now access the new task through the element registry
    console.log(this.elementRegistry.get(task.id)); // Shape { "type": "bpmn:Task", ... }

    // (5) Connect the existing start event to new task
    this.modeling.connect(startEvent, task);

  }

  public bpmnFactory;

  async BusinessObjects() {
    await this.importDiagram(this.diagramXML);
    // (1) Get the modules
    this.bpmnFactory = this.bpmnJS.get('bpmnFactory'),
      this.elementFactory = this.bpmnJS.get('elementFactory'),
      this.elementRegistry = this.bpmnJS.get('elementRegistry'),
      this.modeling = this.bpmnJS.get('modeling');

    // (2) Get the existing process and the start event
    const process = this.elementRegistry.get('Process_1'),
      startEvent = this.elementRegistry.get('StartEvent_1');

    // You can access the start event's business object
    console.log(startEvent.businessObject); // { "$type": "bpmn:StartEvent", ... }

    // (3) Instead of relying on the element factory to automatically create a business object use
    // the BPMN factory to create one
    const taskBusinessObject = this.bpmnFactory.create('bpmn:Task', { id: 'Task_1', name: 'Task' });

    // (4) Create a new diagram shape using the business object you just created
    const task = this.elementFactory.createShape({ type: 'bpmn:Task', businessObject: taskBusinessObject });

    // (5) Add the new task to the diagram
    this.modeling.createShape(task, { x: 400, y: 100 }, process);

    // Using the `id` property we specified you can now access the new task through the element registry
    console.log(this.elementRegistry.get('Task_1')); // Shape { "type": "bpmn:Task", ... }
    // (5) Connect the existing start event to new task
    this.modeling.connect(startEvent, task);
  }




  async creatingShapes() {
    await this.importDiagram(this.diagramXML);

    // (1) Get the modules
    this.bpmnFactory = this.bpmnJS.get('bpmnFactory'),
      this.elementFactory = this.bpmnJS.get('elementFactory'),
      this.elementRegistry = this.bpmnJS.get('elementRegistry'),
      this.modeling = this.bpmnJS.get('modeling');

    // (2) Get the existing process and the start event
    const process = this.elementRegistry.get('Process_1'),
      startEvent = this.elementRegistry.get('StartEvent_1');

    // (3) Create a service task shape
    const serviceTask = this.elementFactory.createShape({ type: 'bpmn:ServiceTask' });

    // (4) Add the new service task shape to the diagram using `appendShape` to connect it to an existing
    // shape
    this.modeling.appendShape(startEvent, serviceTask, { x: 400, y: 100 }, process);

    // (5) Create a boundary event shape
    const boundaryEvent = this.elementFactory.createShape({ type: 'bpmn:BoundaryEvent' });

    // (6) Add the new boundary event to the diagram attaching it to the service task
    this.modeling.createShape(boundaryEvent, { x: 400, y: 140 }, serviceTask, { attach: true });

    // (7) Create an event sub process business object
    const eventSubProcessBusinessObject = this.bpmnFactory.create('bpmn:SubProcess', {
      triggeredByEvent: true,
      isExpanded: true
    });

    // (8) Create the SubProcess shape, set the previously created event sub process business object
    const eventSubProcess = this.elementFactory.createShape({
      type: 'bpmn:SubProcess',
      businessObject: eventSubProcessBusinessObject,
      isExpanded: true
    });

    // (9) Add the event sub process to the diagram
    this.modeling.createShape(eventSubProcess, { x: 300, y: 400 }, process);

    // (10) Create a timer start event specifying `eventDefinitionType` so an event definition will
    // be added
    const timerStartEvent = this.elementFactory.createShape({
      type: 'bpmn:StartEvent',
      eventDefinitionType: 'bpmn:TimerEventDefinition'
    });

    // (11) Add the new timer start event to the diagram specifying the event sub process as the target
    // so the event will be a child of it
    this.modeling.createShape(timerStartEvent, { x: 200, y: 400 }, eventSubProcess);

    // (12) Finally, create a new group shape specifying width and height
    const group = this.elementFactory.createShape({ type: 'bpmn:Group', width: 400, height: 200 });

    // (13) Add the new group to the diagram
    this.modeling.createShape(group, { x: 325, y: 100 }, process);

    // (14) Create two shapes specifying x and y which will be treated as relative
    // coordinates, not absolute
    const messageStartEvent = this.elementFactory.createShape({
      type: 'bpmn:StartEvent',
      eventDefinitionType: 'bpmn:MessageEventDefinition',
      x: 0,
      y: 22
    });

    const userTask = this.elementFactory.createShape({
      type: 'bpmn:UserTask',
      x: 100,
      y: 0
    });

    // (15) Add multiple shapes to the diagram
    this.modeling.createElements([messageStartEvent, userTask], { x: 300, y: 600 }, process);

  }

  async connectingShapes() {
    await this.importDiagram(this.diagramXML);

    // (1) Get the modules
    this.elementFactory = this.bpmnJS.get('elementFactory'),
      this.elementRegistry = this.bpmnJS.get('elementRegistry'),
      this.modeling = this.bpmnJS.get('modeling');

    // (2) Get the existing process and the start event
    const process = this.elementRegistry.get('Process_1'),
      startEvent = this.elementRegistry.get('StartEvent_1');

    // (3) Create a task shape
    const task = this.elementFactory.createShape({ type: 'bpmn:Task' });

    // (4) Add the new service task shape to the diagram
    this.modeling.createShape(task, { x: 400, y: 100 }, process);

    // (5) Connect the existing start event to new task using `connect`
    this.modeling.connect(startEvent, task);

    // (6) Create a end event shape
    const endEvent = this.elementFactory.createShape({ type: 'bpmn:EndEvent' });

    // (7) Add the new end event shape to the diagram
    this.modeling.createShape(endEvent, { x: 600, y: 100 }, process);

    // (8) Create a new sequence flow connection that connects the task to the end event
    this.modeling.createConnection(task, endEvent, { type: 'bpmn:SequenceFlow' }, process);

  }




  async collaborations() {
    await this.importDiagram(this.diagramXML);

    // (1) Get the modules
    this.elementFactory = this.bpmnJS.get('elementFactory'),
      this.elementRegistry = this.bpmnJS.get('elementRegistry'),
      this.modeling = this.bpmnJS.get('modeling');


    // (2) Get the existing process and the start event
    const process = this.elementRegistry.get('Process_1'),
      startEvent = this.elementRegistry.get('StartEvent_1');

    // (3) Create a new participant shape using `createParticipantShape`
    const participant = this.elementFactory.createParticipantShape({ type: 'bpmn:Participant' });

    // (4) Add the new participant to the diagram turning the process into a collaboration
    this.modeling.createShape(participant, { x: 400, y: 100 }, process);

    // The existing start event is now a child of the participant
    console.log(startEvent.parent); // Shape { "type": "bpmn:Participant", ... }

    // (5) Create a lane
    const lane = this.modeling.addLane(participant, 'bottom');

    // (6) Create two nested lanes
    this.modeling.splitLane(lane, 2);

    // (7) Create another participant shape that is collapsed
    // const collapsedParticipant = this.elementFactory
    // this.modeling.createParticipantShape({ type: 'bpmn:Participant', isExpanded: false });
    const collapsedParticipant = this.elementFactory.createParticipantShape({ type: 'bpmn:Participant', isExpanded: false });

    // (8) Add the participant to the diagram
    this.modeling.createShape(collapsedParticipant, { x: 300, y: 500 }, process);

    // (9) Connect the two participants through a message flow
    this.modeling.connect(collapsedParticipant, participant);

  }

  public sequenceFlow;
  public task;
  public exclusiveGateway;
  public startEvent;
  public businessObject;

  async editElements() {
    await this.importDiagram(this.editingElemtns);
  }
  async editElements2() {


    // (1) Get the modules
    this.bpmnFactory = this.bpmnJS.get('bpmnFactory'),
      this.elementRegistry = this.bpmnJS.get('elementRegistry'),
      this.modeling = this.bpmnJS.get('modeling');

    // (2) Get the shapes
    this.startEvent = this.elementRegistry.get('StartEvent_1'),
      this.exclusiveGateway = this.elementRegistry.get('ExclusiveGateway_1'),
      this.sequenceFlow = this.elementRegistry.get('SequenceFlow_3'),
      this.task = this.elementRegistry.get('Task_1');

    // (3) Change the start event's `name` property using `updateProperties`
    this.modeling.updateProperties(this.startEvent, { name: 'Foo' });
    this.modeling.updateProperties(this.startEvent, { myid: 'xxxx' });

    // (4) Change the `defaultFlow` property of a gateway
    this.modeling.updateProperties(this.exclusiveGateway, {
      default: this.sequenceFlow.businessObject
    });

    // (5) Change a task to be multi-instance
    const multiInstanceLoopCharacteristics = this.bpmnFactory.create('bpmn:MultiInstanceLoopCharacteristics');
    this.modeling.updateProperties(this.task, {
      loopCharacteristics: multiInstanceLoopCharacteristics
    });

  }

  public canvas;
  public overlays;
  public graphicsFactory;
  async colorElements() {
    await this.importDiagram(this.editingElemtns);


    // (1) Get the modules
    if (this.useModeler) {
      this.bpmnFactory = this.bpmnJS.get('bpmnFactory');
      this.modeling = this.bpmnJS.get('modeling');
    }
    this.elementRegistry = this.bpmnJS.get('elementRegistry');



    // (2) Get the shapes
    this.startEvent = this.elementRegistry.get('StartEvent_1'),
      this.exclusiveGateway = this.elementRegistry.get('ExclusiveGateway_1'),
      this.sequenceFlow = this.elementRegistry.get('SequenceFlow_3'),
      this.task = this.elementRegistry.get('Task_1');
    this.canvas = this.bpmnJS.get('canvas');
    this.overlays = this.bpmnJS.get('overlays');
    this.canvas.zoom('fit-viewport');

    /////

    // Option 2: Color via BPMN 2.0 Extension
    this.task = this.elementRegistry.get('Task_1');
    if (this.useModeler) {
      this.modeling.setColor([this.task], {
        stroke: 'green',
        fill: 'rgb(152, 203, 152)'
      });
    }

    // let overlayHtml = ('<div class="green">')

    // this.overlays.add('Task_1', {
    //   position: {
    //     top: 0,
    //     left: 0
    //   },
    //   html: overlayHtml
    // });
     //await this.sleep(3000);
     //alert ("wakeup");
   /////
   this.overlays = this.bpmnJS.get('overlays');

   // attach an overlay to a node
   this.overlays.add('Task_1', {
     position: {
       bottom: 0,
       right: 100
     },
     html: '<div style="background-color: #b2f699;" >Completed</div>'
   });
   
   ////
    console.log("this.task:", this.task);
    this.canvas.addMarker(this.task, 'highlightx');
    //this.canvas.addMarker('Task_1', 'highlightx');
    console.log("this.task:", this.task);
    
    //console.log("this.canvas:", this.canvas);
    if (!this.useModeler)
      return;
    this.businessObject = this.task.businessObject;
    let stroke =  'green';
    let fill = 'rgba(0, 80, 0, 0.4)';
    
    this.businessObject.di.set('stroke', stroke);
    this.businessObject.di.set('fill', fill);
    this.elementRegistry = this.bpmnJS.get('elementRegistry');
    this.graphicsFactory = this.bpmnJS.get('graphicsFactory');

    const gfx = this.elementRegistry.getGraphics(this.task);
    const type = this.task.waypoints ? 'connection' : 'shape';
    this.graphicsFactory.update(type, this.task, gfx);

    //https://stackoverflow.com/questions/52440558/adding-colors-to-bpmn-js-viewer
    // check customer rendering:
    //https://github.com/bpmn-io/bpmn-js-example-custom-rendering
  }
 
  public  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}



