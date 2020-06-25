import { Node as NRNode, NodeProperties, Red } from 'node-red';
export declare abstract class Node {
    red: Red;
    protected constructor(RED: Red);
    createNode(config: NodeProperties): void;
    static registerType(RED: Red, type: string, opts?: any): void;
}
export interface Node extends NRNode {
}
