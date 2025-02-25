#!/usr/bin/env node
'use strict'

require('dotenv-safe').load()

const fs = require('fs')
const program = require('commander')

const summarize = require('./summarize')
const { version } = require('../package')

module.exports = (argv) => {
  program
    .version(version)
    .usage('[options] <file>')
    .option('-n, --num-sentences <n>', 'number of sentences (defaults to variable length)', parseInt)
    .option('-t, --title <title>', 'title')
    .option('-c, --content-type <type>', 'sets content type to html or text', (s) => s, 'html')
    .option('-d, --detailed', 'print detailed info for top sentences')
    .option('-D, --detailedAll', 'print detailed info for all sentences')
    .option('-P, --no-pretty-print', 'disable pretty-printing output')
    .action(async (file, opts) => {
      const input = fs.readFileSync(file, 'utf8')
      const {
        contentType,
        detailed,
        detailedAll,
        numSentences,
        title
      } = opts

      if (contentType !== 'html' && contentType !== 'text') {
        throw new Error(`invalid content-type "${contentType}"`)
      }

      try {
        const isHtml = (contentType === 'html')

        const summary = await summarize({
          html: isHtml ? input : null,
          text: isHtml ? null : input,
          numSentences,
          detailed,
          detailedAll,
          title
        })

        if (opts.noPrettyPrint) {
          console.log(JSON.stringify(summary))
        } else {
          console.log(JSON.stringify(summary, null, 2))
        }
      } catch (err) {
        console.error('summarization error', err)
        throw err
      }
    })
    .parse(argv)
}
