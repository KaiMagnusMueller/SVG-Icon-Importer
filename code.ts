
// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

console.clear()


const nodes = figma.currentPage.findAllWithCriteria({
  types: ['FRAME']
})

let existingIcons = []

if (nodes.length !== 0) {
  nodes.forEach(i => {
    const data = i.getPluginData("importedIcon")
    if (!data) {
      return
    }
    existingIcons.push(JSON.parse(data))
  });
}

// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 320, height: 400 });

if (existingIcons.length !== 0) {
  figma.ui.postMessage({ type: "loaded-nodes", data: existingIcons })
} else {
  figma.ui.postMessage({ type: "loaded-nodes-empty" })
}




// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = msg => {
  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.
  if (msg.type === 'create-rectangles') {
    const nodes: SceneNode[] = [];
    for (let i = 0; i < msg.count; i++) {
      const rect = figma.createRectangle();
      rect.x = i * 150;
      rect.fills = [{ type: 'SOLID', color: { r: 1, g: 0.5, b: 0 } }];
      figma.currentPage.appendChild(rect);
      nodes.push(rect);
    }
    figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);
  }

  if (msg.type === 'create-svg') {
    const nodes: SceneNode[] = [];

    const svg = figma.createNodeFromSvg(msg.doc)

    svg.x = 0
    svg.y = 0

    console.log(svg);

    console.log(msg.doc);


    const component = figma.createComponent()
    component.resizeWithoutConstraints(svg.width, svg.height)
    component.name = "title: " + msg.title
    component.appendChild(svg)

    component.x = 64
    component.y = 0

    //    figma.currentPage.appendChild(svg);
  }

  if (msg.type === 'create-library') {
    const nodes: SceneNode[] = [];
    // console.log(msg.doc);

    msg.doc.forEach((element, i) => {
      const svg = figma.createNodeFromSvg(element.svg)
      svg.name = "title: " + element.name

      svg.x = 0 + 64 * i
      svg.y = 400

      const pluginData = element

      svg.setPluginData("importedIcon", JSON.stringify(pluginData))
    });

  }

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  //figma.closePlugin();
};

