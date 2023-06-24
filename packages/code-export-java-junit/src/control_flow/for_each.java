ArrayList collection${collectionName} = (ArrayList) vars.get("${collectionVarName}");
for (int i${iteratorName} = 0; i < collection${collectionName}.size() - 1; i${iteratorName}++) {
  vars.put("${iteratorVarName}", collection${collectionName}.get(i));
