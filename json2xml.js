function json2xml(o, tab) {
    var isArray;
    var arraySize;
    var arrayPosition = 0;
    var toXml = function (v, name, ind) {
            var xml = "";
            if (v instanceof Array) {
                isArray = true;
                arraySize = v.length;
                debugger;
                for (var i = 0, n = v.length; i < n; i++) {
                    arrayPosition++;
                    xml += ind + toXml(v[i], name, ind + "\t") + "\n";
                }
                arrayPosition=0;
            } else if (typeof (v) == "object") {
                var hasChild = false;
                if (arrayPosition <= 1) {
                    xml += ind + "<" + name;
                }
                for (var m in v) {
                    if (m.charAt(0) == "@")
                        xml += " " + m.substr(1) + "=\"" + v[m].toString() + "\"";
                    else
                        hasChild = true;
                    if (arrayPosition <= 1) {
                        xml += hasChild ? ">" : "/>";
                    }
                }
                if (hasChild) {
                    for (var m in v) {
                        if (m == "#text")
                            xml += v[m];
                        else if (m == "#cdata")
                            xml += "<![CDATA[" + v[m] + "]]>";
                        else if (m.charAt(0) != "@")
                            xml += toXml(v[m], m, ind + "\t");
                    }
                    if (!isArray) {
                        xml += (xml.charAt(xml.length - 1) == "\n" ? ind : "") + "</" + name + ">";
                    } else {
                        xml += (xml.charAt(xml.length - 1) == "\n" ? ind : "") + arrayPosition == arraySize ? "</" + name + ">" : "";
                    }
                }
            } else {
                xml += ind + "<" + name + ">" + v.toString() + "</" + name + ">";
            }
            return xml;
        },
        xml = "";
    for (var m in o)
        xml += toXml(o[m], m, "");
    return tab ? xml.replace(/\t/g, tab) : xml.replace(/\t|\n/g, "");
}
