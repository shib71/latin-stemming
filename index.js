
module.exports.quewords = ['atque','quoque','neque','itaque','absque','apsque','abusque','adaeque','adusque','denique', 
                           'deque','susque','oblique','peraeque','plenisque','quandoque','quisque','quaeque', 
                           'cuiusque','cuique','quemque','quamque','quaque','quique','quorumque','quarumque',
                           'quibusque','quosque','quasque','quotusquisque','quousque','ubique','undique','usque', 
                           'uterque','utique','utroque','utribique','torque','coque','concoque','contorque',
                           'detorque','decoque','excoque','extorque','obtorque','optorque','retorque','recoque',
                           'attorque','incoque','intorque','praetorque'];

module.exports.nounsuffixes = [/ibus$/,/ius$/,/ae$/,/am$/,/as$/,/em$/,/es$/,/ia$/,/is$/,
                               /nt$/,/os$/,/ud$/,/um$/,/us$/,/a$/,/e$/,/i$/,/o$/,/u$/];

module.exports.verbsuffixes = [[/iuntur$/,"i"], [/beris$/,"bi"], [/erunt$/,"i"], [/untur$/,"i"] , [/iunt$/,"i"],
                               [/mini$/,""], [/untur$/,"i"], [/stis$/,""], [/bor$/,"bi"], [/ero$/,"eri"], [/mur$/,""],
                               [/mus$/,""], [/ris$/,""], [/sti$/,""], [/tis$/,""], [/tur$/,""], [/unt$/,"i"],
                               [/bo$/,"bi"], [/ns$/,""], [/nt$/,""], [/ri$/,""], [/m$/,""], [/r$/,""], [/s$/,""], [/t$/,""]];

module.exports.stem = function(word,config){
  var quewords = config.quewords || module.exports.quewords;
  var nounsuffixes = config.nounsuffixes || module.exports.nounsuffixes;
  var verbsuffixes = config.verbsuffixes || module.exports.verbsuffixes;
  var type = config.type || "Unknown";
  var stem = word.replace(/j/g,'i').replace(/v/g,'u');
  
  var results = [];
  
  // -que words - some are atomic, others are 'and'
  if (stem.slice(-3)=="que"){
    if (quewords.indexOf(stem)>-1)
      return [ stem ];
    else
      stem = stem.slice(0,-3);
  }
  
  // noun de-suffixing
  if (type=="Unknown" || type=="Noun" || type=="Adjective" || type=="Adverb"){
    for (var i=0; i<nounsuffixes.length; i++){
      if (stem.search(nounsuffixes[i])>-1){
        results.push(stem.replace(nounsuffixes[i],''));
        i = nounsuffixes.length;
      }
    }
  }
  
  // verb de-suffixing
  if (type=="Unknown" || type=="Verb"){
    for (var i=0; i<verbsuffixes.length; i++){
      if (stem.search(verbsuffixes[i][0])>-1){
        results.push(stem.replace(verbsuffixes[i][0],verbsuffixes[i][1]));
        i = verbsuffixes.length;
      }
    }
  }
  
  if (!results.length)
    results.push(stem);
  
  return results;
};

module.exports.couchkey = function(config){
  config.condition = config.condition || "";
  config.quewords = config.quewords || module.exports.quewords;
  config.nounsuffixes = config.nounsuffixes || module.exports.nounsuffixes;
  config.verbsuffixes = config.verbsuffixes || module.exports.verbsuffixes;
  config.wordkey = config.wordkey || "word";
  config.typekey = config.typekey || "wordclass";
  
  var fn = [
    "(function(doc){",
    "var quewords=",JSON.stringify(config.quewords),",",
    "nounsuffixes=",JSON.stringify(config.quewords),",",
    "verbsuffixes=",JSON.stringify(config.verbsuffixes),",",
    "wordkey=",JSON.stringify(config.wordkey),",",
    "typekey=",JSON.stringify(config.typekey),";"
  ];
  
  if (config.condition.length){
    fn.push("if (");
    fn.push(config.condition);
    fn.push("){");
  }
  
  // normalize word value
  fn.push("var stem=doc[wordkey].replace(/j/g,'i').replace(/v/g,'u');");
  
  // -que words - some are atomic, others are 'and'
  fn.push("if (stem.slice(-3)=='que'){");
  fn.push("  if (quewords.indexOf(stem)>-1){");
  fn.push("    emit(stem,null);");
  fn.push("    return;");
  fn.push("  }");
  fn.push("  else{");
  fn.push("    stem = stem.slice(0,-3);");
  fn.push("  }");
  fn.push("}");
  
  // noun de-suffixing
  fn.push("if (doc[typekey]=='Noun' || doc[typekey]=='Adjective' || doc[typekey]=='Adverb'){");
  fn.push("  for (var i=0; i<nounsuffixes.length; i++){");
  fn.push("    if (stem.search(nounsuffixes[i])>-1){");
  fn.push("      stem = stem.replace(nounsuffixes[i],'');");
  fn.push("      i = nounsuffixes.length;");
  fn.push("    }");
  fn.push("  }");
  fn.push("}");
  
  // verb de-suffixing
  fn.push("if (doc[typekey]==='Verb'){");
  fn.push("  for (var i=0; i<verbsuffixes.length; i++){");
  fn.push("    if (stem.search(verbsuffixes[i][0])>-1){");
  fn.push("      stem = stem.replace(verbsuffixes[i][0],verbsuffixes[i][1]);");
  fn.push("      i = verbsuffixes.length;");
  fn.push("    }");
  fn.push("  }");
  fn.push("}");
  
  // only emit stems that are >2 characters long
  fn.push("if (stem.length > 1)");
  fn.push("  emit(stem,null);");
  fn.push("else if (doc[wordkey].length <= 3)");
  fn.push("  emit(doc[wordkey],null);");
  
  
  if (config.condition.length){
    fn.push("}");
  }
  
  fn.push("})");
  
  return eval(fn.join(""));
};