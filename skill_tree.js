// skill_tree.js - version responsive

const data = {
  name: "SD",
  children: [
    { name: "Visualisation", children: [{ name: "Power BI" }, { name: "Tableau" }, { name: "Matplotlib" }, { name: "SeaBorn"}] },
    { name: "Traitement", children: [
        { name: "Python", children: [{name: "NumPy"}, {name: "Pandas"}, {name: "Selenium"}] },
        { name: "R", children: [{name: "Tidyverse"}, {name: "R Shiny"}, {name: "R Dashboard"}] },
        { name: "SAS" },
        { name: "Base de données", children: [{name: "Oracle"}, {name: "MySQL"}, {name: "Access"}] }
    ]},
    { name: "Analyse", children: [
        { name: "SQL" },
        { name: "Statistiques", children: [{name: "Descriptives"}, {name: "Inférentielle"}, {name: "Prévisions"}, {name: "ACP/ACM"}] }
    ]}
  ]
};

let i = 0; // id compteur
let root;  // racine utilisée par update
let resizeTimer = null;

// fonction principale qui (re)trace l'arbre
function renderTree() {
  // vide le SVG précédent
  d3.select("#tree").selectAll("*").remove();

  const container = document.getElementById("tree");
  const width = container.clientWidth || window.innerWidth;
  // hauteur raisonnable : ni trop petite ni trop grande
  const height = Math.max(700, Math.min(window.innerHeight * 0.8, 900));

  const margin = { top: 20, right: 20, bottom: 20, left: 20 };
  const innerWidth = Math.max(400, width - margin.left - margin.right);
  const innerHeight = Math.max(200, height - margin.top - margin.bottom);

  // svg responsive
  const svg = d3.select("#tree")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("width", "100%")
    .style("height", "auto");

  // groupe principal avec marge à gauche pour ne pas couper les labels
  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // layout tree : taille = [height, width] (x parcourt innerHeight, y parcourt innerWidth)
  const treeLayout = d3.tree().size([innerHeight, innerWidth]);

  // (re)crée la hiérarchie
  root = d3.hierarchy(data);
  root.x0 = innerHeight / 2;
  root.y0 = 0;

  // calcule profondeur max pour adapter spacing horizontal
  const maxDepth = d3.max(root.descendants(), d => d.depth) || 1;
  // spacing calculé dynamiquement, borné pour lisibilité :
  const depthSpacing = Math.max(60, innerWidth / (maxDepth + 1)); // au moins 60px entre niveaux

  // fonction d'update (similaire à ton code, mais en utilisant 'g' comme conteneur)
  function update(source) {
    const treeData = treeLayout(root);
    const nodes = treeData.descendants();
    const links = treeData.links();

    // applique un y en fonction de la profondeur (adaptatif)
    nodes.forEach(d => d.y = d.depth * depthSpacing + 0);

    // --- NODES ---
    const node = g.selectAll('g.node')
      .data(nodes, d => d.id || (d.id = ++i));

    const nodeEnter = node.enter().append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${source.y0},${source.x0})`)
      .on('click', (event, d) => {
        if (d.children) {
          d._children = d.children;
          d.children = null;
        } else {
          d.children = d._children;
          d._children = null;
        }
        update(d);
      });

    nodeEnter.append('circle')
      .attr('r', 1e-6)
      .style("fill", d => d._children ? "#FFD369" : "#EEEEEE");

    nodeEnter.append('text')
      .attr("dy", -15)
      .attr("x", 0)
      .attr("text-anchor", "middle")
      .text(d => d.data.name);

    const nodeUpdate = nodeEnter.merge(node);

    nodeUpdate.transition()
      .duration(300)
      .attr('transform', d => `translate(${d.y},${d.x})`);

    nodeUpdate.select('circle')
      .attr('r', 8)
      .style("fill", d => d._children ? "#FFD369" : "#EEEEEE");

    const nodeExit = node.exit().transition()
      .duration(300)
      .attr('transform', d => `translate(${source.y},${source.x})`)
      .remove();

    nodeExit.select('circle').attr('r', 1e-6);
    nodeExit.select('text').style('fill-opacity', 1e-6);

    // --- LINKS ---
    const link = g.selectAll('path.link')
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

    // sauvegarde des positions pour transitions futures
    nodes.forEach(d => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  function diagonal(d) {
    // courbe en C depuis source -> target (coordonnées relatives au groupe g)
    return `M ${d.source.y} ${d.source.x}
            C ${(d.source.y + d.target.y) / 2} ${d.source.x},
              ${(d.source.y + d.target.y) / 2} ${d.target.x},
              ${d.target.y} ${d.target.x}`;
  }

  // collapse (optionnel)
  function collapse(d) {
    if (d.children) {
      d._children = d.children;
      d._children.forEach(collapse);
      d.children = null;
    }
  }
  // si tu veux replier au départ, décommente la ligne suivante:
  // root.children.forEach(collapse);

  // lance l'affichage
  update(root);
}

// premier rendu
renderTree();

// on ré-rend si la fenêtre change de taille (debounce pour éviter rafales)
window.addEventListener('resize', function () {
  if (resizeTimer) clearTimeout(resizeTimer);
  resizeTimer = setTimeout(function () {
    // reset compteur i si tu veux garder ids propres (optionnel)
    i = 0;
    renderTree();
  }, 180);
});
