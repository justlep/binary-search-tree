import {BinarySearchTree, defaultCompareKeysFunction} from './bst.js';
import {defaultCheckValueEquality, hasOwnProp} from './customUtils.js';

/**
 * Self-balancing binary search tree using the AVL implementation
 */
export class AVLTree {
    /**
     * We can't use a direct pointer to the root node (as in the simple binary search tree)
     * as the root will change during tree rotations
     * @param {Object} [options]
     * @param {Boolean}  options.unique Whether to enforce a 'unique' constraint on the key or not
     * @param {Function} options.compareKeys Initialize this BST's compareKeys
     */
    constructor(options = {}) {
        this.tree = new _AVLTree(options);
    }

    // Insert in the internal tree, update the pointer to the root if needed
    insert(key, value) {
        let newTree = this.tree.insert(key, value);

        // If newTree is undefined, that means its structure was not modified
        if (newTree) {
            this.tree = newTree;
        }
    }

    // Delete a value
    delete(key, value) {
        let newTree = this.tree.delete(key, value);

        // If newTree is undefined, that means its structure was not modified
        if (newTree) {
            this.tree = newTree;
        }
    }

    
    checkIsAVLT() {
        this.tree.checkIsAVLT();
    }

    // Other functions we want to use on an AVLTree as if it were the internal _AVLTree
    
    getNumberOfKeys() {
        return this.tree.getNumberOfKeys(...arguments);
    }

    search() {
        return this.tree.search(...arguments);
    }

    betweenBounds() {
        return this.tree.betweenBounds(...arguments);
    }

    prettyPrint() {
        return this.tree.prettyPrint(...arguments);
    }

    executeOnEveryNode(fn) {
        return this.tree.executeOnEveryNode(fn);
    }
}


/**
 * exported for testing only
 * @internal
 */
export class _AVLTree extends BinarySearchTree {

    /**
     * @param {Object} options Optional
     * @param {Boolean}  options.unique Whether to enforce a 'unique' constraint on the key or not
     * @param {Key}      options.key Initialize this BST's key with key
     * @param {Value}    options.value Initialize this BST's data with [value]
     * @param {Function} options.compareKeys Initialize this BST's compareKeys
     */
    constructor(options = {}) {
        super(options);

        this.left = null;
        this.right = null;
        this.parent = options.parent ?? null;
        if (hasOwnProp(options, 'key')) {
            this.key = options.key;    
        }
        this.data = hasOwnProp(options, 'value') ? [options.value] : [];
        this.unique = !!options.unique;

        this.compareKeys = options.compareKeys || defaultCompareKeysFunction;
        this.checkValueEquality = options.checkValueEquality || defaultCheckValueEquality;
    }

    /**
     * Check the recorded height is correct for every node
     * Throws if one height doesn't match
     */
    checkHeightCorrect() {
        let leftH, rightH;

        if (!hasOwnProp(this, 'key')) {
            return;
        }   // Empty tree

        if (this.left && this.left.height === undefined) {
            throw new Error('Undefined height for node ' + this.left.key);
        }
        if (this.right && this.right.height === undefined) {
            throw new Error('Undefined height for node ' + this.right.key);
        }
        if (this.height === undefined) {
            throw new Error('Undefined height for node ' + this.key);
        }

        leftH = this.left ? this.left.height : 0;
        rightH = this.right ? this.right.height : 0;

        if (this.height !== 1 + Math.max(leftH, rightH)) {
            throw new Error('Height constraint failed for node ' + this.key);
        }
        if (this.left) {
            this.left.checkHeightCorrect();
        }
        if (this.right) {
            this.right.checkHeightCorrect();
        }
    }


    /**
     * Return the balance factor
     */
    balanceFactor() {
        let leftH = this.left ? this.left.height : 0,
            rightH = this.right ? this.right.height : 0;
        return leftH - rightH;
    }


    /**
     * Check that the balance factors are all between -1 and 1
     */
    checkBalanceFactors() {
        if (Math.abs(this.balanceFactor()) > 1) {
            throw new Error('Tree is unbalanced at node ' + this.key);
        }

        if (this.left) {
            this.left.checkBalanceFactors();
        }
        if (this.right) {
            this.right.checkBalanceFactors();
        }
    }


    /**
     * When checking if the BST conditions are met, also check that the heights are correct
     * and the tree is balanced
     */
    checkIsAVLT() {
        this.checkIsBST();
        this.checkHeightCorrect();
        this.checkBalanceFactors();
    }

    /**
     * Perform a right rotation of the tree if possible
     * and return the root of the resulting tree
     * The resulting tree's nodes' heights are also updated
     */
    rightRotation() {
        if (!this.left) {
            return this;
        }
        
        let q = this, 
            p = this.left, 
            b = p.right;

        // Alter tree structure
        if (q.parent) {
            p.parent = q.parent;
            if (q.parent.left === q) {
                q.parent.left = p;
            } else {
                q.parent.right = p;
            }
        } else {
            p.parent = null;
        }
        p.right = q;
        q.parent = p;
        q.left = b;
        if (b) {
            b.parent = q;
        }

        // Update heights
        let ah = p.left ? p.left.height : 0,
            bh = b ? b.height : 0,
            ch = q.right ? q.right.height : 0;
        
        q.height = Math.max(bh, ch) + 1;
        p.height = Math.max(ah, q.height) + 1;

        return p;
    }


    /**
     * Perform a left rotation of the tree if possible
     * and return the root of the resulting tree
     * The resulting tree's nodes' heights are also updated
     */
    leftRotation() {
        if (!this.right) {
            return this;
        }

        let p = this,
            q = this.right,
            b = q.left;

        // Alter tree structure
        if (p.parent) {
            q.parent = p.parent;
            if (p.parent.left === p) {
                p.parent.left = q;
            } else {
                p.parent.right = q;
            }
        } else {
            q.parent = null;
        }
        q.left = p;
        p.parent = q;
        p.right = b;
        if (b) {
            b.parent = p;
        }

        // Update heights
        let ah = p.left ? p.left.height : 0,
            bh = b ? b.height : 0,
            ch = q.right ? q.right.height : 0;
        p.height = Math.max(ah, bh) + 1;
        q.height = Math.max(ch, p.height) + 1;

        return q;
    }


    /**
     * Modify the tree if its right subtree is too small compared to the left
     * Return the new root if any
     */
    rightTooSmall() {
        if (this.balanceFactor() <= 1) {
            return this;
        }
        
        if (this.left.balanceFactor() < 0) {
            this.left.leftRotation();
        }

        return this.rightRotation();
    }


    /**
     * Modify the tree if its left subtree is too small compared to the right
     * Return the new root if any
     */
    leftTooSmall() {
        if (this.balanceFactor() >= -1) {
            return this;
        }

        if (this.right.balanceFactor() > 0) {
            this.right.rightRotation();
        }

        return this.leftRotation();
    }


    /**
     * Rebalance the tree along the given path. The path is given reversed (as he was calculated
     * in the insert and delete functions).
     * Returns the new root of the tree
     * Of course, the first element of the path must be the root of the tree
     * @param {_AVLTree[]} path
     * @return {_AVLTree}
     */
    rebalanceAlongPath(path) {
        if (!hasOwnProp(this, 'key')) {
            delete this.height;
            return this;
        } // empty tree
        
        let newRoot = this;
        
        // Re-balance the tree and update all heights
        for (let i = path.length - 1, elem; i >= 0; i--) {
            elem = path[i];
            elem.height = 1 + Math.max(elem.left ? elem.left.height : 0, elem.right ? elem.right.height : 0);

            if (elem.balanceFactor() > 1) {
                let rotated = elem.rightTooSmall();
                if (i === 0) {
                    newRoot = rotated;
                }
            }

            if (elem.balanceFactor() < -1) {
                let rotated = elem.leftTooSmall();
                if (i === 0) {
                    newRoot = rotated;
                }
            }
        }

        return newRoot;
    }


    /**
     * Insert a key, value pair in the tree while maintaining the AVL tree height constraint
     * Return a pointer to the root node, which may have changed
     */
    insert(key, value) {
        // Empty tree, insert as root
        if (!hasOwnProp(this, 'key')) {
            this.key = key;
            this.data.push(value);
            this.height = 1;
            return this;
        }

        let insertPath = [],
            currentNode = this;

        // Insert new leaf at the right place
        while (true) {
            // Same key: no change in the tree structure
            if (currentNode.compareKeys(currentNode.key, key) === 0) {
                if (currentNode.unique) {
                    let err = new Error('Can\'t insert key ' + key + ', it violates the unique constraint');
                    err.key = key;
                    err.errorType = 'uniqueViolated';
                    throw err;
                } else {
                    currentNode.data.push(value);
                }
                return this;
            }

            insertPath.push(currentNode);

            if (currentNode.compareKeys(key, currentNode.key) < 0) {
                if (!currentNode.left) {
                    insertPath.push(currentNode.createLeftChild({key: key, value: value}));
                    break;
                } else {
                    currentNode = currentNode.left;
                }
            } else if (!currentNode.right) {
                insertPath.push(currentNode.createRightChild({key: key, value: value}));
                break;
            } else {
                currentNode = currentNode.right;
            }
        }

        return this.rebalanceAlongPath(insertPath);
    }


    /**
     * Delete a key or just a value and return the new root of the tree
     * @param {Key} key
     * @param {Value} value Optional. If not set, the whole key is deleted. If set, only this value is deleted
     */
    delete(key, value) {
        if (!hasOwnProp(this, 'key')) {
            return this;
        }   // Empty tree

        let currentNode = this,
            deletePath = [];
        
        // Either no match is found and the function will return from within the loop
        // Or a match is found and deletePath will contain the path from the root to the node to delete after the loop
        while (true) {
            if (currentNode.compareKeys(key, currentNode.key) === 0) {
                break;
            }

            deletePath.push(currentNode);

            if (currentNode.compareKeys(key, currentNode.key) < 0) {
                if (currentNode.left) {
                    currentNode = currentNode.left;
                } else {
                    return this;   // Key not found, no modification
                }
            } else if (currentNode.right) {
                currentNode = currentNode.right;
            } else {
                return this;   // Key not found, no modification
            }
        }

        // Delete only a value (no tree modification)
        if (currentNode.data.length > 1 && value !== undefined) {
            currentNode.data = currentNode.data.filter(d => !currentNode.checkValueEquality(d, value));
            return this;
        }

        // Delete a whole node

        // Leaf
        if (!currentNode.left && !currentNode.right) {
            if (currentNode === this) {   // This leaf is also the root
                delete currentNode.key;
                currentNode.data = [];
                delete currentNode.height;
                return this;
            }
            if (currentNode.parent.left === currentNode) {
                currentNode.parent.left = null;
            } else {
                currentNode.parent.right = null;
            }
            return this.rebalanceAlongPath(deletePath);
        }


        // Node with only one child
        if (!currentNode.left || !currentNode.right) {
            let replaceWith = currentNode.left ? currentNode.left : currentNode.right;

            if (currentNode === this) {   // This node is also the root
                replaceWith.parent = null;
                return replaceWith;   // height of replaceWith is necessarily 1 because the tree was balanced before deletion
            }
            
            if (currentNode.parent.left === currentNode) {
                currentNode.parent.left = replaceWith;
                replaceWith.parent = currentNode.parent;
            } else {
                currentNode.parent.right = replaceWith;
                replaceWith.parent = currentNode.parent;
            }

            return this.rebalanceAlongPath(deletePath);
        }


        // Node with two children
        // Use the in-order predecessor (no need to randomize since we actively rebalance)
        deletePath.push(currentNode);
        let replaceWith = currentNode.left;

        // Special case: the in-order predecessor is right below the node to delete
        if (!replaceWith.right) {
            currentNode.key = replaceWith.key;
            currentNode.data = replaceWith.data;
            currentNode.left = replaceWith.left;
            if (replaceWith.left) {
                replaceWith.left.parent = currentNode;
            }
            return this.rebalanceAlongPath(deletePath);
        }

        // After this loop, replaceWith is the right-most leaf in the left subtree
        // and deletePath the path from the root (inclusive) to replaceWith (exclusive)
        while (true) {
            if (replaceWith.right) {
                deletePath.push(replaceWith);
                replaceWith = replaceWith.right;
            } else {
                break;
            }
        }

        currentNode.key = replaceWith.key;
        currentNode.data = replaceWith.data;

        replaceWith.parent.right = replaceWith.left;
        if (replaceWith.left) {
            replaceWith.left.parent = replaceWith.parent;
        }

        return this.rebalanceAlongPath(deletePath);
    }
}
