import { devLog } from '../utils/RGCommon';
import { NodesAnalyticResult, RGLevelDirection, RGNodesAnalytic } from '../utils/RGNodesAnalytic';
import SeeksBaseLayouter from './SeeksBaseLayouter';
import { RGNode, RGOptionsFull, RGTreeLayoutOptions } from '../types';

export class SeeksBidirectionalTreeLayouter extends SeeksBaseLayouter {
  constructor(layoutOptions:RGTreeLayoutOptions, graphOptions:RGOptionsFull) {
    super(layoutOptions, graphOptions);
    this.layoutOptions = layoutOptions;
    devLog('new SeeksBidirectionalTreeLayouter:', this.layoutOptions);
    if (!this.layoutOptions.from) this.layoutOptions.from = 'left';
    if (this.layoutOptions.levelDistance) {
      if (typeof this.layoutOptions.levelDistance === 'string') {
        this.levelDistanceArr = this.layoutOptions.levelDistance.split(',').map(thisNum => Number.parseInt(thisNum));
      } else if (Array.isArray(this.layoutOptions.levelDistance)) {
        this.levelDistanceArr = this.layoutOptions.levelDistance;
      }
    }
  }
  layoutOptions:RGTreeLayoutOptions;
  levelDistanceArr: number[] = [];
  async refresh() {
    devLog('SeeksBidirectionalTreeLayouter:refresh:nodes:', this.allNodes.length);
    await this.placeNodes(this.allNodes, this.rootNode);
  }
  analysisNodes4Didirectional(willLayoutNodes:RGNode[], thisLevelNodes:RGNode[], thisDeep:number, analyticResult:NodesAnalyticResult, levelDirect:RGLevelDirection) {
    devLog(`${levelDirect} level ${thisDeep} size: ${thisLevelNodes.length}`)
    if (thisLevelNodes.length > analyticResult.max_length) {
      analyticResult.max_length = thisLevelNodes.length;
    }
    if (thisDeep > analyticResult.max_deep) {
      analyticResult.max_deep = thisDeep;
    }
    const __thisLOT_subling = {
      level: thisDeep,
      all_size: thisLevelNodes.length,
      all_strength: 0
    };
    const newLevelNodes:RGNode[] = [];
    thisLevelNodes.forEach(thisNode => {
      if (!thisNode.lot)thisNode.lot = { childs: [] };
      thisNode.lot.eached = true;
      thisNode.lot.subling = __thisLOT_subling;
      thisNode.lot.level = thisDeep;
      willLayoutNodes.push(thisNode);
    });
    let __thisLevel_index = 0;
    // var __prev_node
    thisLevelNodes.forEach(thisNode => {
      let __thisNode_child_size = 0;
      if (levelDirect === -1) {
        let __thisTargetIndex = 0;
        thisNode.targetFrom.forEach((thisTarget) => {
          if (!thisTarget.lot)thisTarget.lot = { eached: false, childs: [] };
          if (!thisTarget.lot.eached) {
            thisTarget.lot.parent = thisNode;
            if (RGNodesAnalytic.isAllowShowNode(thisTarget)) {
              thisTarget.lot.eached = true;
              thisTarget.lot.index_of_parent = __thisTargetIndex++;
              // thisTarget.lot.prevNode = __prev_node
              // if (__prev_node)__prev_node.lot.nextNode = thisTarget
              // __prev_node = thisTarget
              thisNode.lot.childs.push(thisTarget);
              newLevelNodes.push(thisTarget);
              __thisNode_child_size++;
            } else {
              thisNode.lot.childs.push(thisTarget);
            }
          }
        });
      } else {
        let __thisTargetIndex = 0;
        thisNode.targetTo.forEach((thisTarget) => {
          if (!thisTarget.lot)thisTarget.lot = { eached: false, childs: [] };
          if (!thisTarget.lot.eached) {
            thisTarget.lot.parent = thisNode;
            if (RGNodesAnalytic.isAllowShowNode(thisTarget)) {
              thisTarget.lot.eached = true;
              thisTarget.lot.index_of_parent = __thisTargetIndex++;
              // thisTarget.lot.prevNode = __prev_node
              // if (__prev_node)__prev_node.lot.nextNode = thisTarget
              // __prev_node = thisTarget
              // console.log('add node to next-level:', thisTarget.text);
              thisNode.lot.childs.push(thisTarget);
              newLevelNodes.push(thisTarget);
              __thisNode_child_size++;
            } else {
              thisNode.lot.childs.push(thisTarget);
            }
          }
        });
      }
      thisNode.lot.strength = __thisNode_child_size > 0 ? __thisNode_child_size : 1;
      __thisLOT_subling.all_strength += thisNode.lot.strength;
      thisNode.lot.strength_plus = __thisLOT_subling.all_strength;
      thisNode.lot.index_of_level = __thisLevel_index;
      thisNode.lot.childs_size = __thisNode_child_size;
      __thisLevel_index++;
    });
    if (__thisLOT_subling.all_strength > analyticResult.max_strength) {
      analyticResult.max_strength = __thisLOT_subling.all_strength;
    }
    if (newLevelNodes.length > 0) {
      this.analysisNodes4Didirectional(willLayoutNodes, newLevelNodes, thisDeep + levelDirect, analyticResult, levelDirect);
    } else {
      willLayoutNodes.forEach(thisNode => {
        if (thisNode.lot.childs_size > 0) {
          thisNode.lot.strengthWithChilds = 0;
        }
      });
      willLayoutNodes.forEach(thisNode => {
        if (thisNode.lot.childs_size === 0) {
          thisNode.lot.strengthWithChilds = 1;
          RGNodesAnalytic.conductStrengthToParents(thisNode);
        }
      });
      RGNodesAnalytic.analysisDataTree([willLayoutNodes[0]], 0, levelDirect);
      // willLayoutNodes.forEach(thisNode => {
      //   thisNode.text = thisNode.lot.strengthWithChilds_from + ':' + thisNode.lot.strengthWithChilds + '/' + thisNode.lot.strength
      // })
    }
  }
  async placeNodes(allNodes:RGNode[], rootNode?:RGNode) {
    devLog('SeeksBidirectionalTreeLayouter:placeNodes');
    if (!rootNode) {
      console.error('root is null');
      return;
    } else {
      devLog('layout by root:', rootNode);
    }
    this.rootNode = rootNode;
    this.allNodes = allNodes;
    devLog('allNodes:', allNodes.length);
    allNodes.forEach(thisNode => {
      // thisNode.lot = { eached: false }
      thisNode.lot.eached = false;
      thisNode.lot.notLeafNode = false;
      thisNode.lot.childs = [];
      thisNode.lot.parent = undefined;
      thisNode.lot.index_of_parent = 0;
      thisNode.lot.strength = 0;
      thisNode.lot.strengthWithChilds_from = 0;
      thisNode.lot.strengthWithChilds = 0;
      thisNode.lot.placed = false;
    });
    // this.rootNode.fixed = true
    let groupNodes:RGNode[] = [];
    let analyticResult = {
      max_deep: 1,
      max_length: 1,
      max_strength: 1
    };
    RGNodesAnalytic.analysisNodes(groupNodes, [this.rootNode], 0, analyticResult);
    groupNodes = [];
    analyticResult = {
      max_deep: 1,
      max_length: 1,
      max_strength: 1
    };
    this.analysisNodes4Didirectional(groupNodes, [this.rootNode], 0, analyticResult, -1);
    this.placeNodesPosition(this.rootNode, groupNodes, analyticResult);
    groupNodes = [];
    analyticResult = {
      max_deep: 1,
      max_length: 1,
      max_strength: 1
    };
    this.analysisNodes4Didirectional(groupNodes, [this.rootNode], 0, analyticResult, 1);
    this.placeNodesPosition(this.rootNode, groupNodes, analyticResult);
    devLog('allNodes:', groupNodes.length);
    if (!this.graphOptions.useAnimationWhenExpanded) {
      this.allNodes.forEach(thisNode => {
        if (thisNode.fixed === true) {
          thisNode.lot.placed = true;
          return;
        }
        if (!RGNodesAnalytic.isAllowShowNode(thisNode)) return;
        if (Number.isNaN(thisNode.lot.x)) {
          devLog('bad lot x:', thisNode.text, thisNode.lot.x);
          thisNode.lot.x = 0;
        }
        if (Number.isNaN(thisNode.lot.y)) {
          devLog('bad lot y:', thisNode.text, thisNode.lot.y);
          thisNode.lot.y = 0;
        }
        thisNode.x = RGNodesAnalytic.getNodeXByLotX(this.graphOptions, thisNode);
        thisNode.y = RGNodesAnalytic.getNodeYByLotY(this.graphOptions, thisNode);
        thisNode.lot.placed = true;
      });
      devLog('create rootNode coordinates:1', rootNode.x, rootNode.y);
    } else {
      devLog('Play layout animation.....');
      await this.animationLayout();
      devLog('create rootNode coordinates:3', rootNode.x, rootNode.y);
    }
  }
  placeNodesPosition(rootNode:RGNode, groupNodes:RGNode[], analyticResult:NodesAnalyticResult) {
    if (rootNode.fixed !== true) {
      const _center_offset_x = this.layoutOptions.centerOffset_x || 0;
      const _center_offset_y = this.layoutOptions.centerOffset_y || 0;
      rootNode.lot.x = _center_offset_x;
      rootNode.lot.y = _center_offset_y;
      if (this.layoutOptions.fixedRootNode) {
        rootNode.lot.x = RGNodesAnalytic.getLotXByNodeX(this.graphOptions, rootNode);
        rootNode.lot.y = RGNodesAnalytic.getLotYByNodeY(this.graphOptions, rootNode);
      } else {
        if (this.layoutOptions.from === 'top') {
          rootNode.lot.y -= (this.graphOptions.viewSize.height / 2) - 100;
        } else if (this.layoutOptions.from === 'bottom') {
          rootNode.lot.y += (this.graphOptions.viewSize.height / 2) - 200;
        } else if (this.layoutOptions.from === 'right') {
          rootNode.lot.x += (this.graphOptions.viewSize.width / 2) - 100;
        } else {
          rootNode.lot.x -= (this.graphOptions.viewSize.width / 2) - 100;
        }
      }
      devLog('debug0910:Graph center:', rootNode.lot.x, rootNode.lot.y, { _center_offset_x, _center_offset_y });
      // devLog('create rootNode coordinates:', rootNode.text, rootNode.x, rootNode.y, this.graphSetting.canvasSize.width, this.graphSetting.canvasSize.height, this.graphSetting.canvasOffset.x, this.graphSetting.canvasOffset.y);
      // rootNode.x = rootNode.lot.x + __offsetX;
      // rootNode.y = rootNode.lot.y + __offsetY;
    } else {
      if (rootNode.origin_x === undefined) {
        rootNode.origin_x = rootNode.x;
        rootNode.origin_y = rootNode.y;
      }
      rootNode.lot.x = rootNode.origin_x;
      rootNode.lot.y = rootNode.origin_y;
      devLog('固定位置的rootNode:', rootNode.text, rootNode.x, rootNode.y);
    }
    rootNode.lot.placed = true;
    this.placeRelativePosition(rootNode, groupNodes, analyticResult);
  }
  placeRelativePosition(rootNode:RGNode, groupNodes:RGNode[], analyticResult:NodesAnalyticResult) {
    const viewSize = this.graphOptions.viewSize;
    if (this.layoutOptions.from === 'left' || this.layoutOptions.from === 'right') {
      const __min_per_height = this.layoutOptions.min_per_height || 80;
      const __max_per_height = this.layoutOptions.max_per_height || 400;
      const __min_per_width = this.layoutOptions.min_per_width || 430;
      const __max_per_width = this.layoutOptions.max_per_width || 650;
      let __per_width = Math.round((viewSize.width - 10) / (analyticResult.max_deep + 2));
      if (__per_width < __min_per_width)__per_width = __min_per_width;
      if (__per_width > __max_per_width)__per_width = __max_per_width;
      let __per_height = Math.round(viewSize.height / (analyticResult.max_strength + 1));
      if (__per_height < __min_per_height)__per_height = __min_per_height;
      if (__per_height > __max_per_height)__per_height = __max_per_height;
      groupNodes.forEach(thisNode => {
        if (thisNode.fixed === true) return;
        if (thisNode.lot.placed === true) return;
        if (thisNode === rootNode) return;
        if (this.layoutOptions.from === 'right') {
          thisNode.lot.x = rootNode.lot.x! - this.getLevelDistance(thisNode, thisNode.lot.subling!.level, __per_width);
        } else {
          thisNode.lot.x = rootNode.lot.x! + this.getLevelDistance(thisNode, thisNode.lot.subling!.level, __per_width);
        }
      });
      groupNodes.forEach(thisNode => {
        if (thisNode.fixed === true) return;
        if (thisNode.lot.level !== 0) {
          thisNode.lot.y = rootNode.lot.y! + __per_height * ((analyticResult.max_strength / -2) + thisNode.lot.strengthWithChilds_from! + thisNode.lot.strengthWithChilds! / 2);
        }
      });
    } else {
      const __min_per_height = this.layoutOptions.min_per_height || 350;
      const __max_per_height = this.layoutOptions.max_per_height || 400;
      const __min_per_width = this.layoutOptions.min_per_width || 250;
      const __max_per_width = this.layoutOptions.max_per_width || 500;
      let __per_width = Math.round((viewSize.width - 10) / (analyticResult.max_strength + 2));
      if (__per_width < __min_per_width)__per_width = __min_per_width;
      if (__per_width > __max_per_width)__per_width = __max_per_width;
      let __per_height = Math.round((viewSize.height - 10) / (analyticResult.max_deep + 2));
      if (__per_height < __min_per_height)__per_height = __min_per_height;
      if (__per_height > __max_per_height)__per_height = __max_per_height;
      groupNodes.forEach(thisNode => {
        if (thisNode.fixed === true) return;
        if (thisNode.lot.placed === true) return;
        if (thisNode === rootNode) return;
        if (this.layoutOptions.from === 'bottom') {
          thisNode.lot.y = rootNode.lot.y! - this.getLevelDistance(thisNode, thisNode.lot.subling!.level, __per_height);
        } else {
          thisNode.lot.y = rootNode.lot.y! + this.getLevelDistance(thisNode, thisNode.lot.subling!.level, __per_height);
        }
      });
      groupNodes.forEach(thisNode => {
        if (thisNode.fixed === true) return;
        if (thisNode.lot.level !== 0) {
          thisNode.lot.x = rootNode.lot.x! + __per_width * ((analyticResult.max_strength / -2) + thisNode.lot.strengthWithChilds_from! + thisNode.lot.strengthWithChilds! / 2);
          // thisNode.lot.x = rootNode.lot.x
        }
      });
    }
  }
  getLevelDistance(node:RGNode, level:number, perSize:number) {
    const absLevel = Math.abs(level);
    if (this.levelDistanceArr && this.levelDistanceArr.length > 0) {
      let _distance = 0;
      for (let i = 0; i < absLevel; i++) {
        const _thisLevelDistance = this.levelDistanceArr[i] || 100;
        _distance += _thisLevelDistance;
      }
      return level > 0 ? _distance : _distance * -1;
    } else {
      return level * perSize;
    }
  }
}

export default SeeksBidirectionalTreeLayouter;
