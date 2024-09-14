import { JsonLine, JsonNode, RGElementLine, RGGraphData, RGGraphReactiveData, RGJsonData, RGLayouter, RGLayoutOptions, RGLine, RGLineColorItem, RGLink, RGListeners, RGNode, RGOptions } from '../types';
import { RelationGraphWith1Dom } from './RelationGraphWith1Dom';
export declare class RelationGraphWith2Data extends RelationGraphWith1Dom {
    graphData: RGGraphData;
    seeksNodeIdIndex: number;
    allLineColors: RGLineColorItem[];
    userLayouerClass?: RGLayouter;
    layouter: RGLayouter;
    reactiveData: RGGraphReactiveData;
    constructor(options: RGOptions, listeners: RGListeners);
    setReactiveData(graphData: RGGraphData, reactiveData: RGGraphReactiveData): void;
    setReactiveDataVue3(graphData: RGGraphData, reactiveData: RGGraphReactiveData): void;
    disableNextLayoutAnimation: boolean;
    protected _setOptions(options: RGOptions): void;
    protected _initLayoutByLayoutOptions(layoutOptions: RGLayoutOptions): void;
    initLayouter(): void;
    protected _setJsonData(jsonData: RGJsonData, resetViewSize?: boolean): Promise<void>;
    clearGraph(): Promise<void>;
    clearElementLines(): Promise<void>;
    generateNewNodeId(addIndex?: number): string;
    loadNodes(_nodes: JsonNode[]): void;
    loadLines(_lines: JsonLine[]): void;
    flatNodeData(orign_nodes: JsonNode[], parentNode: JsonNode | null, nodes_collect: JsonNode[], lines_collect: JsonLine[]): void;
    loadGraphJsonData(jsonData: RGJsonData): void;
    getLineArrow(_color: string | undefined, isStartArrow?: boolean, checked?: boolean): string;
    getNodes(): RGNode[];
    getLinks(): RGLink[];
    getGraphJsonData(): {
        rootId: string;
        nodes: JsonNode[];
        lines: JsonLine[];
    };
    getGraphJsonOptions(): {};
    printGraphJsonData(): void;
    getNodeById(nodeId: string): RGNode;
    getLinkById(linkId: string): RGLink;
    getLinkByLineId(lineId: string): RGLink;
    addNodes(nodes: JsonNode[]): void;
    addLines(lines: JsonLine[]): void;
    addElementLines(lines: JsonLine[]): void;
    getElementLineById(elLineId: string): RGLink;
    getElementLines(): RGLine[];
    removeElementLine(elementLine: RGElementLine): void;
    removeELementLineById(elementLineId: string): void;
    private elLineUpdating;
    updateElementLines(): void;
    private _updateElementLines;
    private _updateElementLinePosition;
    getElementPosition(elementId: string): {
        x: number;
        y: number;
    };
    removeNodeById(nodeId: string): void;
    removeNode(node: RGNode): void;
    removeLinkByTwoNode(node1Id: string, node2Id: string): void;
    getGroupByNode(node: RGNode, groupNodes?: RGNode[]): RGNode[];
    private _clearItem;
    removeNodeRef(node: RGNode, refNode: RGNode): void;
    removeLinkById(linkId: string): void;
    removeLink(link: RGLink): void;
    removeLine(link: RGLink, line: RGLine): void;
    setNodePosition(node: RGNode, x: number, y: number): void;
    getGraphOffet(): {
        offset_x: number;
        offset_y: number;
    };
    setCanvasCenter(x: number, y: number): void;
    setCanvasOffset(x: number, y: number): void;
    findGroupNodes(node: RGNode, childs: RGNode[]): void;
    resetViewSize(): void;
    refreshNVAnalysisInfo(): void;
    getStuffSize(nodes?: RGNode[]): {
        width: number;
        height: number;
        minX: number;
        maxX: number;
        minY: number;
        maxY: number;
    };
    getNodesCenter(): {
        x: number;
        y: number;
    };
    querySearchAsync(queryString: string): RGNode[];
    printOptions(): void;
    printData(): void;
    loading(graphLoadingText?: string): void;
    clearLoading(): void;
    updateVisbleViewNodes(force?: boolean): void;
    private _updateVisbleViewNodes;
}