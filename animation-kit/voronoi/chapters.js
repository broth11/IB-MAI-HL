function lesson(id,title,stage,subtitle,see,notice,remember,rows) {
  let t=0;
  const chapters=rows.map(([id,label,text,alt,reveal=1.25,hold=2.4])=>{
    const step={id,label,text,alt,t,reveal,rest:t+reveal+hold/2};
    t+=reveal+hold;
    return step;
  });
  return {id,title,stage,subtitle,read:{see,notice,remember},chapters,duration:t};
}
const T=String.raw;
module.exports=[
lesson('perpendicular-bisector','Perpendicular bisectors and equal distances','Perpendicular bisector','The line of points equidistant from $A$ and $B$',
'The blue line passes through the midpoint of $[AB]$ at a right angle.',
['The two right triangles share $PM$ and have $AM=BM$. So $PA=PB$.',
'Off the line, the shorter horizontal leg identifies the nearer site.'],
'A point is equidistant from $A$ and $B$ exactly when it lies on $[AB]$’s perpendicular bisector.',[
['segment','Join $A$ and $B$','Plot $A(-4,0)$ and $B(8,0)$. The segment $[AB]$ is horizontal.','A horizontal segment joins A at (−4, 0) and B at (8, 0).'],
['midpoint','Bisect at a right angle',T`Mark $M(2,0)$. The bisector $x=2$ meets $[AB]$ at $90^\circ$, with $AM=MB=6$.`,'Vertical line x = 2 through midpoint M, with a right-angle square.'],
['move','Slide $P$ along the bisector','The triangles share $PM$ and have $AM=MB$. By Pythagoras, $PA=PB$.','P above the midpoint. Both right triangles have the same horizontal legs and the same vertical leg.',2.4],
['off','Move $P$ off the bisector','Both triangles have the same height. The horizontal leg to $B$ is shorter, so $PB<PA$.','P is to the right of x = 2. Segment PB is shorter than segment PA.',1.9],
['summary','Perpendicular bisector rule','On $x=2$, $PA=PB$. To either side, one distance is shorter.','Two matching right triangles under P on x = 2.',.35,3.7]
]),
lesson('graph-intersection','Find an intersection on the Casio fx‑CG50','Graph intersection','Casio fx-CG50',
'G‑Solv locates the point that lies on both graphs.',
[T`Enter the equations as $Y_1$ and $Y_2$. Use the $X,\theta,T$ key for $X$.`,
'Adjust V‑Window if needed. Read $X$ and $Y$ together as an ordered pair.'],
'GRAPH → enter both functions → F6 (DRAW) → SHIFT + F5 (G‑Solv) → F5 (INTSECT).',[
['enter','Enter two functions','Open GRAPH. Enter $Y_1=-X$ and $Y_2=2X-6$. Press EXE after each line.','Calculator Graph Func list showing Y1 = −X and Y2 = 2X − 6.'],
['draw','Draw the graphs','Press F6 (DRAW). Adjust V‑Window if the intersection is out of view.','The calculator graph shows the two straight lines crossing.'],
['gsolv','Open G‑Solv','Press SHIFT then F5 to open the graph-solving menu.','Calculator graph with the G‑Solv soft-key menu open.'],
['intersection','Find the intersection','Press F5 (INTSECT). Read $X=2$ and $Y=-2$.','The cursor is at the crossing. The readout is X = 2, Y = −2.'],
['summary','State the ordered pair','The lines intersect at $(2,-2)$. Both equations give $y=-2$ when $x=2$.','Calculator readout confirms both lines meet at (2, −2).',.45,3.65]
]),
lesson('three-sites','Construct a Voronoi diagram from three sites','Three sites, one vertex','Perpendicular bisectors and the circumcircle',
'The three perpendicular bisectors meet at the circumcentre.',
['The radius of the circumcircle is the common distance from the vertex to the three sites.',
'Keep each ray where its two sites are tied for nearest.'],
'The circumcentre is equidistant from all three sites.',[
['sites','Plot three sites','Join $A(-4,0)$, $B(8,0)$ and $C(0,4)$ to form a triangle.','Triangle with sites A, B and C at the specified coordinates.'],
['ab',T`Draw $\mathrm{PB}(A,B)$`,T`$[AB]$ is horizontal. Its midpoint is $(2,0)$, so $\mathrm{PB}(A,B)$ is $x=2$.`,'Vertical bisector through (2, 0), with a right-angle square.'],
['ac',T`Draw $\mathrm{PB}(A,C)$`,T`$[AC]$ has midpoint $(-2,2)$ and gradient $1$. Its bisector has gradient $-1$, so $y=-x$.`,'The line y = −x passes through midpoint (−2, 2) at a right angle to AC.'],
['bc',T`Draw $\mathrm{PB}(B,C)$`,T`$[BC]$ has midpoint $(4,2)$ and gradient $-\tfrac12$. Its bisector has gradient $2$, so $y=2x-6$.`,'The line y = 2x − 6 passes through midpoint (4, 2) at a right angle to BC.'],
['vertex','Locate the circumcentre','The bisectors intersect at $V(2,-2)$, equidistant from $A$, $B$ and $C$.','All three bisectors cross at V(2, −2).'],
['radius','Calculate the radius',T`From $V$ to $A$, the coordinate changes have magnitudes $6$ and $2$, so $VA=\sqrt{6^2+2^2}=2\sqrt{10}$.`,'A right-angle square and legs of length 6 and 2 show how to find the radius. The circle passes through all three sites.',2.2],
['summary','Keep the three Voronoi rays','Keep only the rays where the tied pair of sites is nearest. Those rays bound the three cells.','Three shaded cells meet at V. The circumcircle touches all three sites.',.3,3.7]
]),
lesson('trim-bisectors','Where do four-site Voronoi edges stop?','Where does an edge stop?','Four sites and two Voronoi vertices',
T`Test points on the horizontal bisector $\mathrm{PB}(C,D)$.`,
['On the left $A$ is nearest, in the middle $C$ and $D$ tie, and on the right $B$ is nearest.',
'The two cutoffs $V_1$ and $V_2$ occur where a third site joins the tie.'],
'Keep the part of a bisector where its two sites are tied for nearest.',[
['candidate',T`Draw $\mathrm{PB}(C,D)$`,'Every point on $y=0$ is equidistant from $C$ and $D$.','Dashed horizontal bisector of CD, perpendicular to the dashed vertical segment joining C and D.'],
['compare','Check which sites are nearest','Slide $P$ along $y=0$. Site $A$ wins for $x<0$ and $B$ wins for $x>3$. Between them, $C$ and $D$ tie.','The test point moves through an A-nearest region, a C and D tie, then a B-nearest region.',3.3],
['cut','Find the two cutoffs','For $P=(x,0)$, $PC^2=PD^2=x^2+16$. Equate this to $PA^2=(x+4)^2$ for $x=0$, or $PB^2=(x-8)^2$ for $x=3$.','Solid CD edge between V1 and V2, with dashed extensions beyond them.'],
['rays','Keep the four outer rays',T`Apply the same test to $\mathrm{PB}(A,C)$, $\mathrm{PB}(A,D)$, $\mathrm{PB}(B,C)$ and $\mathrm{PB}(B,D)$.`,'Two rays extend from each vertex. A segment joins the vertices.'],
['summary','Read the four cells','Every Voronoi edge is shared by two cells whose sites tie for nearest.','Four shaded Voronoi cells are bounded by one segment and four rays.',.3,3.7]
]),
lesson('add-site','Add a fourth site to a Voronoi diagram','Add a fourth site','Draw cell $D$ and revise the old edges',
'Cell $D$ is the overlap of the three half-planes in which $D$ is at least as close as each original site.',
[T`$\mathrm{PB}(D,A)$ meets $\mathrm{PB}(A,C)$ at $V_1(0,0)$. Both retained rays end there.`,
'The old vertex is now inside cell $D$. The two new vertices are joined by a new edge.'],
'Add a site by drawing its bisectors and retaining the pieces where two sites tie for nearest.',[
['start','Start with three cells','The original edges meet at $V(2,-2)$.','Three coloured cells with a single vertex V.'],
['insert','Test the old vertex',T`$VD=\sqrt{8}$ is shorter than $VA=VB=VC=\sqrt{40}$. So $V$ lies inside cell $D$.`,'D is closer to the old vertex than A is.'],
['against-a',T`Draw $\mathrm{PB}(D,A)$`,'Draw $y=x$ and keep the side that contains $D$.','D and A are connected by a construction segment, with its bisector at a right angle.'],
['left-vertex','End both edges at $V_1$',T`$\mathrm{PB}(D,A)$, $y=x$, meets $\mathrm{PB}(A,C)$, $y=-x$, at $V_1(0,0)$. Keep both rays to the left of $V_1$.`,'Two dashed bisectors cross at V1. The two solid rays on the left both terminate there.',2.2],
['against-b','Compare $D$ with $B$',T`Use $\mathrm{PB}(B,D)$, $y=-2x+6$, to trim cell $D$ again.`,'A second bisector cuts away part of D’s possible territory.'],
['against-c','Compare $D$ with $C$',T`Use $\mathrm{PB}(C,D)$, $y=0$. The new edge joins $V_1(0,0)$ to $V_2(3,0)$.`,'The new cell D appears below the CD edge, with two vertices.',2.6],
['summary','Compare before and after',T`The $AC$ and $BC$ edges are shortened. The old $AB$ edge disappears, and the new $CD$ edge joins $V_1$ to $V_2$.`,'Before insertion there is one vertex. After insertion there are two.',.3,3.7]
]),
lesson('largest-empty-circle','Choose between two empty circles','Largest Empty Circle problem','Compare distances to the nearest town',
'The dashed boundary is the convex hull. Each circle’s radius is its centre’s distance to the nearest town.',
[T`A waste dump needs maximum clearance. Choose $V_2$ with radius $5\,\mathrm{km}$.`,
T`A depot at one of the two vertices must be within $4.5\,\mathrm{km}$ of a town. Only $V_1$ meets that limit.`],
'Choose the radius that fits the question. The Largest Empty Circle problem asks for the maximum.',[
['region','Identify the convex hull','The centre must lie within the convex hull of the four towns. The circle may extend outside the hull.','A dashed quadrilateral through A, B, C and D outlines the convex hull.'],
['first','Calculate the radius at $V_1$',T`$V_1(0,0)$ is $4\,\mathrm{km}$ from $A$, $C$ and $D$. Those towns lie on the circle.`,'Blue radius-4 circle centred at V1, touching A, C and D.',1.65],
['second','Calculate the radius at $V_2$',T`$V_2(3,0)$ is $5\,\mathrm{km}$ from $B$, $C$ and $D$. For $C$ and $D$, use $\sqrt{3^2+4^2}=5$.`,'Orange radius-5 circle centred at V2, touching B, C and D.',1.65],
['boundary','Check the boundary',T`Along an edge of the convex hull, a town is always at most half that edge’s length away. The longest half-edge is $\sqrt{20}<5$.`,'Four hull-edge midpoints are marked with their half-edge lengths.'],
['largest','Waste dump: maximise distance',T`Where is a waste dump farthest from its nearest town? Choose $V_2$. Its nearest town is $5\,\mathrm{km}$ away.`,'Both circles are visible, with the larger orange circle emphasised.',.3,3.7],
['smaller','Depot: meet a distance limit',T`A depot must be at a vertex within $4.5\,\mathrm{km}$ of a town. Choose $V_1$: only its radius is below the limit.`,'Both circles are visible, with the smaller blue circle emphasised.',.3,3.7]
]),
lesson('nearest-neighbour','Nearest neighbour interpolation','Nearest neighbour interpolation','Estimate rainfall at an unmeasured point',
'The sites are rain gauges. The numbers show measured rainfall in millimetres.',
[T`Inside a cell, use its site’s value. On an edge, average the two tied values: $\frac{32+28}{2}=30\,\mathrm{mm}$.`,
T`At vertex $V_1$ the estimate is $\frac{24+32+28}{3}=28\,\mathrm{mm}$.`],
'Use the nearest known value. If several sites are equidistant and nearest, average their values.',[
['gauges','Read the four measurements',T`Sites $A$, $B$, $C$ and $D$ measured $24$, $18$, $32$ and $28\,\mathrm{mm}$, respectively.`,'Four shaded cells show gauge readings A 24, B 18, C 32 and D 28 millimetres.'],
['estimate','Estimate rainfall at $Q$',T`$Q(1,2)$ lies in cell $C$. Its rainfall estimate is $32\,\mathrm{mm}$.`,'A dashed line links Q(1, 2) to C, which measured 32 mm.'],
['cross','Cross the edge',T`Moving from cell $C$ into cell $D$ changes the nearest gauge. The estimate drops from $32$ to $28\,\mathrm{mm}$.`,'Q has crossed into cell D and is linked to D, which measured 28 mm.',2.8],
['tie','Average at an edge',T`At $Q(1,0)$, sites $C$ and $D$ tie for nearest. Estimate $\frac{32+28}{2}=30\,\mathrm{mm}$.`,'Q sits on the CD edge and is linked to both its nearest gauges. The estimate is 30 mm.'],
['vertex','Average at a vertex',T`At $V_1(0,0)$, sites $A$, $C$ and $D$ tie. Estimate $\frac{24+32+28}{3}=28\,\mathrm{mm}$.`,'The vertex V1 links to three nearest gauges. Averaging their readings gives 28 mm.'],
['summary','Use the nearest values','Use one site’s value inside its cell. On an edge or at a vertex, take the mean of all the tied nearest values.','The estimate returns to a point inside cell C. The rule also states to average for a tie.',.3,3.7]
])
];
