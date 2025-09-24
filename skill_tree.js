const data = {
    name: "Data Science",
    children: [
      {
        name: "Visualisation",
        children: [
          { name: "Power BI" },
          { name: "Tableau" },
          { name: "Matplotlib" },
          { name: "SeaBorn"}
        ]
      },
      {
        name: "Traitement",
        children: [
          { name: "Python",
            children: [
              {name: "NumPy"},
              {name: "Pandas"},
              {name: "Selenium"}
            ]
           },
          { name: "R",
            children: [
              {name: "Tidyverse"},
              {name: "R Shiny"},
              {name: "R Dashboard"}
            ]
           },
          { name: "SAS" },
          { name: "Base de données",
            children: [
              {name: "Oracle"},
              {name: "MySQL"},
              {name: "Access"}
            ]
           }
        ]
      },
      {
        name: "Analyse",
        children: [
          { name: "SQL" },
          { name: "Statistiques",
            children: [
            {name: "Descriptives"},
            {name: "Inférentielle"},
            {name: "Prévisions"},
            {name: "Analyses multivariées"}
          ] },
        ]
      }
    ]
  };

  const width = window.innerWidth;   // largeur de la fenêtre
  const height = window.innerHeight; // hauteur de la fenêtre


  const svg = d3.select("#tree")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", "translate(40,0)");

  const treeLayout = d3.tree().size([height, width - 200]);

  let root = d3.hierarchy(data);
  root.x0 = height / 2;
  root.y0 = 0;

  function update(source) {
    const treeData = treeLayout(root);
    const nodes = treeData.descendants();
    const links = treeData.links();

    nodes.forEach(d => d.y = d.depth * 240 + 75);

    // --- NODES ---
    const node = svg.selectAll('g.node')
      .data(nodes, d => d.id || (d.id = ++i));

    const nodeEnter = node.enter().append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${source.y0},${source.x0})`)
      .on('click', (event, d) => {
        if (d.children) {
          // si le nœud est ouvert → on le ferme
          d._children = d.children;
          d.children = null;
        } else {
          // si le nœud est fermé → on le rouvre
          d.children = d._children;
          d._children = null;
        }
        update(d);
      });

    nodeEnter.append('circle')
      .attr('r', 1e-6)
      .style("fill", d => d._children ? "#FFD369" : "EEEEEE");

      nodeEnter.append('text')
      .attr("dy", -15)            // décalage vers le haut
      .attr("x", 0)               // centré horizontalement
      .attr("text-anchor", "middle")
      .text(d => d.data.name);

    const nodeUpdate = nodeEnter.merge(node);

    nodeUpdate.transition()
      .duration(300)
      .attr('transform', d => `translate(${d.y},${d.x})`);

    nodeUpdate.select('circle')
      .attr('r', 8)
      .style("fill", d => d._children ?  "#FFD369" : "EEEEEE");

    const nodeExit = node.exit().transition()
      .duration(300)
      .attr('transform', d => `translate(${source.y},${source.x})`)
      .remove();

    nodeExit.select('circle').attr('r', 1e-6);
    nodeExit.select('text').style('fill-opacity', 1e-6);

    // --- LINKS ---
    const link = svg.selectAll('path.link')
      .data(links, d => d.target.id);

    const linkEnter = link.enter().insert('path', "g")
      .attr("class", "link")
      .attr('d', d => {
        const o = { x: source.x0, y: source.y0 };
        return diagonal({ source: o, target: o });
      });

    const linkUpdate = linkEnter.merge(link);

    linkUpdate.transition()
      .duration(300)
      .attr('d', d => diagonal(d));

    link.exit().transition()
      .duration(300)
      .attr('d', d => {
        const o = { x: source.x, y: source.y };
        return diagonal({ source: o, target: o });
      })
      .remove();

    nodes.forEach(d => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  function diagonal(d) {
    return `M ${d.source.y} ${d.source.x}
            C ${(d.source.y + d.target.y) / 2} ${d.source.x},
              ${(d.source.y + d.target.y) / 2} ${d.target.x},
              ${d.target.y} ${d.target.x}`;
  }

let i = 0; // compteur pour donner des id uniques aux noeuds

// 👇 On replie tout l'arbre au départ
root.children.forEach(collapse);

function collapse(d) {
  if (d.children) {
    d._children = d.children;        // on stocke les enfants dans _children
    d._children.forEach(collapse);   // on applique récursivement
    d.children = null;               // on vide children => noeud replié
  }
}
  update(root);