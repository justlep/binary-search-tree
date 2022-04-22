# Binary search trees for Node.js 
[![Build Status](https://api.travis-ci.com/justlep/binary-search-tree.svg?branch=master)](https://app.travis-ci.com/github/justlep/binary-search-tree)
[![NPM Version](https://img.shields.io/npm/v/@justlep/binary-search-tree.svg)](https://www.npmjs.com/package/@justlep/binary-search-tree)
[![Node.js Version](https://img.shields.io/node/v/@justlep/binary-search-tree.svg)]()

This is a cleaned up and modernized fork of [node-binary-search-tree](https://github.com/louischatriot/node-binary-search-tree/), 
provided as ES module. Written primarily to store indexes for <a href="https://github.com/justlep/nedb" target="_blank">NeDB</a> (a javascript dependency-less database).


* Node.js 14.17.6+
* no dependencies


Two implementations of binary search tree: <a href="http://en.wikipedia.org/wiki/Binary_search_tree" target="_blank">basic</a> and <a href="http://en.wikipedia.org/wiki/AVL_tree" target="_blank">AVL</a> (a kind of self-balancing binary search tree). 

## Installation

```bash
npm install @justlep/binary-search-tree --save
```

## Usage
The API mainly provides 3 functions: `insert`, `search` and `delete`. If you do not create a unique-type binary search tree, you can store multiple pieces of data for the same key. Doing so with a unique-type BST will result in an error being thrown. Data is always returned as an array, and you can delete all data relating to a given key, or just one piece of data.

Values inserted can be anything except `undefined`.

```javascript
import {BinarySearchTree, AVLTree} from '@justlep/binary-search-tree';

// Creating a binary search tree
const bst = new BinarySearchTree();

// Inserting some data
bst.insert(15, 'some data for key 15');
bst.insert(12, 'something else');
bst.insert(18, 'hello');

// You can insert multiple pieces of data for the same key
// if your tree doesn't enforce a unique constraint
bst.insert(18, 'world');

// Retrieving data (always returned as an array of all data stored for this key)
bst.search(15);   // Equal to ['some data for key 15']
bst.search(18);   // Equal to ['hello', 'world']
bst.search(1);    // Equal to []

// Search between bounds with a MongoDB-like query
// Data is returned in key order
// Note the difference between $lt (less than) and $gte (less than OR EQUAL)
bst.betweenBounds({ $lt: 18, $gte: 12});   // Equal to ['something else', 'some data for key 15']

// Deleting all the data relating to a key
bst.delete(15);   // bst.search(15) will now give []
bst.delete(18, 'world');   // bst.search(18) will now give ['hello']
```

There are three optional parameters you can pass the BST constructor, allowing you to enforce a key-uniqueness constraint, use a custom function to compare keys and use a custom function to check whether values are equal. These parameters are all passed in an object.

### Uniqueness

```javascript
const bst = new BinarySearchTree({unique: true});
bst.insert(10, 'hello');
bst.insert(10, 'world');   // Will throw an error
```

### Custom key comparison

```javascript
/**
 * Custom key comparison function for age keys.
 * @param {Object} a
 * @param {Object} b
 * @return {number} - 0 / 1 / -1
 */
function compareKeys(a, b) {
  return (a.age > b.age) ? 1 : (a.age < b.age) ? -1 : 0;
}

// Now we can use objects with an 'age' property as keys
const bst = new BinarySearchTree({ compareKeys });
bst.insert({ age: 23 }, 'Mark');
bst.insert({ age: 47 }, 'Franck');
```
If no custom key comparison function is provided to the constructor, the default one can compare numbers, dates and strings
which are the most common usecases

### Custom value checking

```javascript
// Custom value equality checking function used when we try to just delete one piece of data
// Returns true if a and b are considered the same, false otherwise
// The default function is able to compare numbers and strings
function checkValueEquality (a, b) {
  return a.length === b.length;
}
const bst = new BinarySearchTree({ checkValueEquality });
bst.insert(10, 'hello');
bst.insert(10, 'world');
bst.insert(10, 'howdoyoudo');

bst.delete(10, 'abcde');
bst.search(10);   // Returns ['howdoyoudo']
```


## License 

[MIT](./LICENSE)
