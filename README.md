latin-stemming
==============

Functions for getting the stems for Latin words. Based on the [Schinke algorithm]. The key thing to note about this
approach is that it can be applied to words when it doesn't know what language part (e.g. noun vs verb) it is. In
those cases it will usually return more than one possible stem.

    var stemming = require("latin-stemming");

## Constants

The module uses several hard-coded arrays for lookups and replacements. You can access them yourself via:

* `stemming.quewords` => an array of -que words that are atomic and NOT 'and'
* `stemming.nounsuffixes` => an array of regexes for matching noun suffixes
* `stemming.verbsuffixes` => an array of regexes for matching verb suffixes, and what those suffixes should be replaced with in the stem

## Functions

### `stemming.stem(word, config) // => []`

Word, I hope, is self explanatory. Config is a struct that can contain several optional values:

* *quewords* - override the default quewords list provided by the module
* *nounsuffixes* - override the default noun suffix regexes
* *verbsuffixes* - override the default verb suffixes and replacements
* *type* - if this is "Noun", "Adjective", "Adverb", or "Verb", the stemmer will only apply the relevent stemming rules

### `stemming.couchkey(config) // => Function`

Returns a contextless function that can be used for CouchDB indexes. Config can contain several optional values:

* *condition* - string to be used inside an `if (...)` statement; if you include this, documents will only be processed if they pass the condition
* *wordkey* (defaults to 'word') - the document property containing the word to be stemmed
* *typekey* (defaults to 'wordclass') - the document property that contains language part of the word (e.g. Noun, Verb); if the property is not available, keys for both verb and noun interpretations will be emitted
* *quewords* - override the default quewords list provided by the module
* *nounsuffixes* - override the default noun suffix regexes
* *verbsuffixes* - override the default verb suffixes and replacements


[Schinke algorithm]: http://snowball.tartarus.org/otherapps/schinke/intro.html "The Schinke Latin stemming algorithm"
