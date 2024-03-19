/**
 * Parses the input html and extracts raw text.
 *
 * Also computes a simple measure of distance across all nodes in an html
 * document that will be useful later for matching images with text nodes.
 *
 * TODO: distance should include number of tokens or sentences inbetween nodes.
 * TODO: definitely needs unit tests
 */

'use strict'

const cheerio = require('cheerio')

const tagsToIgnore = new Set([
  'nav',
  'figure',
  'strong',
  'b',
  'i',
  'em',
  'a'
])

module.exports = (opts) => {
  let $, text

  if (opts.dom) {
    $ = opts.dom
    text = $.root().prop('innerText')
  } else if (opts.html) {
    $ = cheerio.load(opts.html)
    text = $.root().prop('innerText')
  } else if (opts.text) {
    text = opts.text.replace(/[\r\n]/g, ' ').replace(/ {2}/g, ' ')

    $ = cheerio.load(`<p>${text}</p>`)
  } else {
    throw new Error('invalid input; missing required "html" or "text"')
  }

  const $root = $($('body').children().get(0))
  const length = initDistanceDFS($, $root, 0)
  $.scale = 1.0 / length

  return {
    text,
    $
  }
}

function initDistanceDFS ($, $node, index) {
  // function to traverse the DOM and assign a unique ID to each node
  // the ID is assigned in order of appearance (DFS, depth-first search)
  // the ID is used to calculate the distance of each node from the beginning of the text
  // the distance is used to determine the weight of each node
  // the return value is the total length of the text in the subtree rooted at $node
  $node.attr('id', index)

  let nextIndex = index;
  const children = $node.children().get();
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    const { tagName } = child;
    if (!tagsToIgnore.has(tagName)) {
      nextIndex = initDistanceDFS($, $(child), nextIndex + 1);
    }
  }

  const next = $node.next().get(0);
  if (next) {
    return initDistanceDFS($, $(next), nextIndex + 1 + $node.text().length);
  } else {
    return nextIndex + $node.text().length;
  }
}

