/*
 Copyright (C) 2007 Apple Inc.  All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions
 are met:
 1. Redistributions of source code must retain the above copyright
    notice, this list of conditions and the following disclaimer.
 2. Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.

 THIS SOFTWARE IS PROVIDED BY APPLE COMPUTER, INC. ``AS IS'' AND ANY
 EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL APPLE COMPUTER, INC. OR
 CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/* The Great Computer Language Shootout
   http://shootout.alioth.debian.org/
   contributed by Isaac Gouy */

package {
        public class TreeNode {
                private var left:TreeNode
                private var right:TreeNode;
                private var item:int;

                public function TreeNode(left:TreeNode, right:TreeNode, item:int){
                        this.left = left;
                        this.right = right;
                        this.item = item;
                }

                public function itemCheck():int {
                        if (this.left==null) return this.item;
                        else return this.item + this.left.itemCheck() - this.right.itemCheck();
                }

                public static function bottomUpTree(item,depth):TreeNode {
                        if (depth>0){
                                return new TreeNode(
                                        bottomUpTree(2*item-1, depth-1)
                                        ,bottomUpTree(2*item, depth-1)
                                        ,item
                                );
                        }
                        else {
                                return new TreeNode(null,null,item);
                        }
                }
        }

        function runAccessBinaryTrees():int {
                for ( var n:int = 4; n <= 10; n += 1 ) {
                    var minDepth:int = 4;
                    var maxDepth:int = Math.max(minDepth + 2, n);
                    var stretchDepth:int = maxDepth + 1;

                    var check:int = TreeNode.bottomUpTree(0,stretchDepth).itemCheck();

                    var longLivedTree:TreeNode = TreeNode.bottomUpTree(0,maxDepth);
                    for (var depth:int=minDepth; depth<=maxDepth; depth+=2){
                        var iterations:int = 1 << (maxDepth - depth + minDepth);

                        check = 0;
                        for (var i:int=1; i<=iterations; i++){
                            check += TreeNode.bottomUpTree(i,depth).itemCheck();
                            check += TreeNode.bottomUpTree(-i,depth).itemCheck();
                        }
                    }
                }
                return check;
        }

        var start:Number = new Date();
        var res:int = runAccessBinaryTrees();
        var totaltime:Number = new Date() - start;

        if (res==-64) {
           print("PASSED res="+res);
        } else {
           print("FAILED binarytrees() expected -64 got "+res);
        }

/*
        if (res==-64) {
           print("metric time "+totaltime);
        } else {
           print("error binarytrees() expected -64 got "+res);
        }
*/
}
