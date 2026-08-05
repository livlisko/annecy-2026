/* =====================================================================
   Annecy 2026 activity-photo manifest.

   Each entry is tied to the actual venue, route, operator, or named place.
   Official-site images stay remote and link back to their source; Commons
   images already shipped with the guide remain local and are credited in
   data.js. Casa Elisa deliberately stays photo-less until we have a private,
   user-owned photo rather than borrowing an unrelated pool image.
   ===================================================================== */
(function () {
  'use strict';

  const D = window.DATA;
  if (!D || !Array.isArray(D.ACTIVITIES)) return;

  const official = (photo, alt, source, credit) => ({
    photo,
    alt,
    source,
    credit: credit || 'Official activity page'
  });
  const local = (photo, alt) => ({ photo, alt });

  const MEDIA = {
    'home-swim': official(
      'https://en.lac-annecy.com/cache/images/39483523_apidae-ficheGallery-full.jpg',
      'La Brune beach in Veyrier-du-Lac',
      'https://en.lac-annecy.com/beach-bathing-area/la-brune-beach-veyrier-du-lac/',
      'Lake Annecy Tourist Office'
    ),
    'menthon-pontoons': official(
      'https://en.lac-annecy.com/cache/images/868462_apidae-ficheGallery-full.jpg',
      'The municipal beach and pontoons at Menthon-Saint-Bernard',
      'https://en.lac-annecy.com/beach-bathing-area/plage-municipale-de-menthon-saint-bernard-menthon-saint-bernard/',
      'Lake Annecy Tourist Office'
    ),
    'angon-apero': official(
      'https://en.lac-annecy.com/cache/images/843403_apidae-ficheGallery-full.jpg',
      'Angon beach on Lake Annecy',
      'https://en.lac-annecy.com/beach-bathing-area/angon-beach-talloires-montmin/',
      'Lake Annecy Tourist Office'
    ),
    'st-jorioz-beach': official(
      'https://en.lac-annecy.com/cache/images/23444795_apidae-ficheGallery-full.jpg',
      'The municipal beach at Saint-Jorioz',
      'https://en.lac-annecy.com/beach-bathing-area/plage-municipale-de-saint-jorioz-saint-jorioz/',
      'Lake Annecy Tourist Office'
    ),
    'doussard-sup': official(
      'https://www.sources-lac-annecy.com/app/uploads/2026/06/%C2%A9TilbyVattard_OT_SLA_2022_Paddle-canoe-5.jpg',
      'A family stand-up paddle outing from Doussard at the south end of Lake Annecy',
      'https://www.sources-lac-annecy.com/activites/paddle/',
      'Tilby Vattard / Sources du lac d\'Annecy'
    ),
    'sup-veyrier': official(
      'https://en.lac-annecy.com/cache/images/36722196_apidae-ficheGallery-full.jpg',
      'Stand-up paddling from Le Deck on La Brune beach in Veyrier-du-Lac',
      'https://en.lac-annecy.com/service/le-deck-de-veyrier-veyrier-du-lac/',
      'Le Deck de Veyrier / Lake Annecy Tourist Office'
    ),
    'navibus-hop': official(
      'https://www.bateaux-annecy.com/wp-content/uploads/2024/02/Grand_promenade_3b.jpg',
      'A Compagnie des Bateaux passenger boat on Lake Annecy',
      'https://www.bateaux-annecy.com/our-sightseeing-cruises/navibus/',
      'Compagnie des Bateaux du Lac d\'Annecy'
    ),
    'diving-baptism': official(
      'https://en.lac-annecy.com/cache/images-alliance/91c50fb3987814deaa4cb02be5d98cfa_alliance-sheet-gallery-full.jpg',
      'A first scuba dive in Lake Annecy',
      'https://en.lac-annecy.com/activite-bookable/first-dive/',
      'Lake Annecy Tourist Office'
    ),
    'sailing-sevrier': official(
      'https://www.cvsevrier.fr/wp-content/uploads/2025/07/DJI_0287-scaled.avif',
      'Sailing from the Cercle de Voile de Sevrier',
      'https://www.cvsevrier.fr/',
      'Cercle de Voile de Sevrier'
    ),
    'lake-loop-road': official(
      'https://en.lac-annecy.com/cache/images/31856388_apidae-ficheGallery-full.jpg',
      'Cyclists riding the Lake Annecy loop',
      'https://en.lac-annecy.com/cycle-tourism-route/cycling-route-around-lake-annecy-annecy/',
      'Lake Annecy Tourist Office'
    ),
    'voie-verte-recovery': local(
      'assets/wiki/voie-verte.jpg',
      'Cyclists on the Lake Annecy greenway'
    ),
    'east-shore-ride': official(
      'https://en.lac-annecy.com/content/uploads/2023/06/Balade_a_velo_le_long_du_lac-Monica_Dalmasso-11595-1920px-980x670.jpg',
      'Cyclists riding beside Lake Annecy',
      'https://en.lac-annecy.com/webzine/riding-the-good-life-on-the-bike-paths-around-lake-annecy/',
      'Lake Annecy Tourist Office'
    ),
    'forclaz-climb-lake': official(
      'https://res.cloudinary.com/resalocal-prod/image/upload/f_auto,q_80,c_fill,g_auto:subject,ar_3:2,w_1200/services/activity_routes/1021/boucle-du-col-de-la-forclaz-velo',
      'Road cycling on the Col de la Forclaz loop',
      'https://smartmap.talloires-lac-annecy.com/en/routes/loop-forclaz-pass',
      'Talloires-Montmin Smart Map'
    ),
    'forclaz-climb-south': official(
      'https://www.lac-annecy.com/cache/images/18114884_apidae-ficheGallery-full.jpeg',
      'The cycling route through Montmin to the Col de la Forclaz',
      'https://www.lac-annecy.com/itineraire-de-velo-a-assistance-electrique/vae-le-tour-du-lac-via-vesonne-montmin-col-de-la-forclaz-annecy/',
      'Lake Annecy Tourist Office'
    ),
    'semnoz-climb': official(
      'https://en.lac-annecy.com/cache/images/27981916_apidae-ficheGallery-full.jpg',
      'Road cyclists passing a Montee du Semnoz climb marker',
      'https://en.lac-annecy.com/routes-for-electrically-assisted-cycles/traversee-du-semnoz-cycling-route-annecy/',
      'Tristan Shu / Annecy Mountains'
    ),
    'tour-semnoz': official(
      'https://api.cloudly.space/resize/crop/1200/627/60/aHR0cHM6Ly9zdGF0aWMuYXBpZGFlLXRvdXJpc21lLmNvbS9maWxlc3RvcmUvb2JqZXRzLXRvdXJpc3RpcXVlcy9pbWFnZXMvMTc5LzE1NS8yODgxMDE2My5qcGc=/image.jpg',
      'A cyclist on the Tour du Semnoz route',
      'https://hautesavoiemontblanc-tourisme.com/offres/tour-du-semnoz-itineraire-cyclo-annecy-fr-5835541/',
      'Haute-Savoie Mont-Blanc Tourism'
    ),
    'glieres-gravel': official(
      'https://en.lac-annecy.com/cache/images/28138014_apidae-ficheGallery-full.jpg',
      'A gravel cyclist crossing the Plateau des Glieres',
      'https://en.lac-annecy.com/gravel-bike-route/traversee-des-glieres-parcours-gravel-annecy/',
      'Lake Annecy Tourist Office'
    ),
    'semnoz-bikepark': official(
      'https://www.semnoz.fr/wp-content/uploads/sites/2/2024/07/RAO05240-scaled.jpg',
      'A mountain biker in the Semnoz bike park',
      'https://www.semnoz.fr/vtt/',
      'Station du Semnoz'
    ),
    'laclusaz-bikepark': official(
      'https://www.laclusaz.com/app/uploads/2023/03/laclusazbikepark___pierremaullet.jpg',
      'A rider in La Clusaz bike park',
      'https://www.laclusaz.com/en/mountain-bike/bikepark/',
      'La Clusaz Tourism'
    ),
    'grandbornand-mtb': official(
      'https://api.cloudly.space/resize/crop/1200/800/75/aHR0cHM6Ly9zdGF0aWMuYXBpZGFlLXRvdXJpc21lLmNvbS9maWxlc3RvcmUvb2JqZXRzLXRvdXJpc3RpcXVlcy9pbWFnZXMvMTY4LzIxMy8yODc1OTQ2NC5qcGc=/image.jpg',
      'E-enduro riding at Le Grand-Bornand',
      'https://en.legrandbornand.com/what-to-do/e-enduro-bikepark-sporty-day-long-tour-le-grand-bornand-en-5595887/',
      'Le Grand-Bornand Tourism'
    ),
    'pumptrack-duingt': official(
      'https://en.lac-annecy.com/cache/images/28440559_apidae-ficheGallery-full.jpeg',
      'Riders on the Duingt pump track',
      'https://en.lac-annecy.com/equipment/pumptrack-duingt/',
      'Lake Annecy Tourist Office'
    ),
    'mont-veyrier-baron': local(
      'assets/activities/mont-veyrier.jpg',
      'The rocky trail on Mont Veyrier above Lake Annecy'
    ),
    'roc-walk': local(
      'assets/wiki/roc-de-chere.jpg',
      'The forested cliffs of the Roc de Chere reserve'
    ),
    'cascade-angon': local(
      'assets/activities/cascade-angon.jpg',
      'The Cascade d\'Angon waterfall'
    ),
    'semnoz-trois-lacs': official(
      'https://www.lac-annecy.com/cache/images/38612731_apidae-ficheGallery-full.jpg',
      'Hikers on the Circuit des Trois Lacs at the Semnoz',
      'https://www.lac-annecy.com/itineraire-de-randonnee-pedestre/le-circuit-des-trois-lacs-semnoz-viuz-la-chiesaz/',
      'Lake Annecy Tourist Office'
    ),
    'glieres-walk': local(
      'assets/wiki/glieres.jpg',
      'The national Resistance monument on the Plateau des Glieres'
    ),
    'parmelan': official(
      'https://www.lac-annecy.com/cache/images/39173834_apidae-ficheGallery-full.jpg',
      'The limestone plateau and hiking trail of the Parmelan',
      'https://www.lac-annecy.com/itineraire-de-randonnee-pedestre/le-plateau-du-parmelan-filliere/',
      'Lake Annecy Tourist Office'
    ),
    'jallouvre-viaferrata': official(
      'https://api.cloudly.space/resize/crop/1200/800/75/aHR0cHM6Ly9zdGF0aWMuYXBpZGFlLXRvdXJpc21lLmNvbS9maWxlc3RvcmUvb2JqZXRzLXRvdXJpc3RpcXVlcy9pbWFnZXMvMTM3LzI1MS82MDI4MTY5LmpwZw==/image.jpg',
      'Climbers on the Tour du Jallouvre via ferrata',
      'https://en.legrandbornand.com/what-to-do/via-ferrata-la-tour-du-jallouvre-le-grand-bornand-en-5595979/',
      'Le Grand-Bornand Tourism'
    ),
    'canyoning-angon': official(
      'https://en.lac-annecy.com/cache/images-alliance/196da81f16a5131015f5f8f2d263b1d2_alliance-sheet-gallery-full.jpg',
      'Canyoning in the Angon canyon',
      'https://en.lac-annecy.com/activite-reservable/canyoning-angon-discovery/',
      'Lake Annecy Tourist Office'
    ),
    'canyoning-montmin': official(
      'https://www.annecyguidesmontagne.com/media/cache/og_filter/2020/04/6368-canyoning-montmin-annecy-0646.jpg',
      'Sport canyoning in the Montmin canyon',
      'https://www.annecyguidesmontagne.com/aventures/canyon-montmin-sportif',
      'Bureau des Guides d\'Annecy'
    ),
    'paragliding-forclaz': official(
      'https://annecy.takamaka.fr/cdata/page/1378/slider/5199/l.jpg?v=1638290022',
      'A tandem paraglider taking off above Lake Annecy',
      'https://annecy.takamaka.fr/fr/p/parapente-annecy',
      'Takamaka Annecy'
    ),
    'accrobranche-talloires': official(
      'https://en.lac-annecy.com/cache/images/35815822_apidae-ficheGallery-full.jpg',
      'The treetop adventure course at Talloires',
      'https://en.lac-annecy.com/service/acroaventures-talloires-talloires-montmin/',
      'Lake Annecy Tourist Office'
    ),
    'annecy-market': local(
      'assets/wiki/annecy-market.jpg',
      'Market stalls beside the canals in old Annecy'
    ),
    'halles-haras': official(
      'https://cdn.prod.website-files.com/690373eece2f517106c9f652/6a2bd5a0abfd4c6201fbbb6b_facade_annecy_inauguration.webp',
      'The Halles du Haras food hall in Annecy',
      'https://biltoki.com/halles/halles-du-haras',
      'Biltoki Halles du Haras'
    ),
    'musee-cinema': official(
      'https://www.citeanimationannecy.com/sites/citeanimationannecy.com/files/styles/visuel_expo_1905_1094/public/2026-06/2026_cite_animation_musee_ext_04_%C2%A9CITE-ANIMATION_L.jpg.webp?itok=IpwyeZO6',
      'The animation cinema museum in Annecy',
      'https://www.citeanimationannecy.com/en/programme/musee-du-cinema-danimation',
      'Cite internationale du cinema d\'animation'
    ),
    'chateau-palais': local(
      'assets/wiki/annecy-old-town.jpg',
      'The Palais de l\'Ile in old Annecy'
    ),
    'gorges-fier': local(
      'assets/wiki/gorges-fier.jpg',
      'The suspended walkway inside the Gorges du Fier'
    ),
    'pierre-gay': official(
      'https://www.haute-savoie-tourisme.org/docs/images/cc689677ef29571918d46bd85ed07ce0',
      'Fromagerie Pierre Gay in Annecy',
      'https://www.haute-savoie-tourisme.org/commerces/alimentaire/fromageries/764734-fromagerie-pierre-gay',
      'Haute-Savoie Tourism'
    ),
    'cave-tasting': official(
      'https://www.lac-annecy.com/cache/images-alliance/4dcca04b06672fffe74714d5648d2ec1_alliance-sheet-gallery-full.jpg',
      'A cheese cave visit and tasting in Annecy',
      'https://www.lac-annecy.com/alti_alliance_post/visite-de-cave-et-atelier-degustation/',
      'Lake Annecy Tourist Office'
    ),
    'veyrier-market': official(
      'https://en.lac-annecy.com/cache/images/440555_apidae-ficheGallery-full.jpg',
      'The weekly market in Veyrier-du-Lac',
      'https://en.lac-annecy.com/event/market-veyrier-du-lac/',
      'Lake Annecy Tourist Office'
    ),
    'savoyard-night': official(
      'https://www.lafermedelaforclaz.com/wp-content/uploads/2024/02/fondue-e1709121565906.jpg',
      'A Savoyard fondue served at La Ferme de la Forclaz',
      'https://www.lafermedelaforclaz.com/restaurant-col-de-la-forclaz/',
      'La Ferme de la Forclaz'
    ),
    'semnoz-picnic': local(
      'assets/wiki/semnoz.jpg',
      'The open Semnoz ridge above Lake Annecy'
    ),
    'forclaz-lunch': official(
      'https://www.lafermedelaforclaz.com/wp-content/uploads/2026/01/20241031_103446-scaled.jpg',
      'La Ferme restaurant at the Col de la Forclaz',
      'https://www.lafermedelaforclaz.com/restaurant-col-de-la-forclaz/',
      'La Ferme de la Forclaz'
    ),
    'aravis-cheese': official(
      'https://www.laclusaz.com/app/uploads/apidae/9665630-diaporama-890x500.jpg',
      'The Reblochon exhibits at the Hameau des Alpes in La Clusaz',
      'https://www.laclusaz.com/en/details/the-hameau-of-the-alps/',
      'La Clusaz Tourism'
    ),
    'chamonix-day': local(
      'assets/wiki/chamonix.jpg',
      'Chamonix valley beneath the Mont Blanc massif'
    ),
    'blue-secret-packraft': official(
      'https://blue-secret.com/wp-content/uploads/2024/03/Bloc-3-hors-des-sentiers-battus.webp',
      'A Blue Secret packraft outing on Lake Annecy',
      'https://blue-secret.com/en/annecy-english-new/',
      'Blue Secret'
    ),
    'skiwake74': official(
      'https://www.skiwake74.com/wp-content/uploads/2016/06/DSF0055-1024x683.jpg',
      'Wakeboarding with Ski Wake 74 on Lake Annecy',
      'https://www.skiwake74.com/en/',
      'Ski Wake 74'
    ),
    'fonds-blancs-sup': official(
      'https://ncy-sup.com/wp-content/uploads/2023/07/ncy-sup-paddle-paradis-lac-annecy-2-scaled.webp',
      'Stand-up paddling toward the Fonds Blancs on Lake Annecy',
      'https://ncy-sup.com/',
      'NCY SUP Center'
    ),
    'les-houches-bikepark': official(
      'https://www.datocms-assets.com/144588/1728573441-activites-vtt_ete.webp?fit=crop&h=800&w=1200',
      'Mountain biking in Les Houches',
      'https://leshouches.montblancnaturalresort.com/en/',
      'Mont-Blanc Natural Resort'
    ),
    'lesgets-bikepark': local(
      'assets/wiki/les-gets-mtb.jpg',
      'A rider in Les Gets Bike Park'
    ),
    'lesgets-lift-walk': local(
      'assets/activities/mont-chery.jpg',
      'Les Gets and the Chablais mountains from Mont Chery'
    ),
    'lesgets-village': local(
      'assets/wiki/les-gets-village.jpg',
      'Les Gets village in summer'
    ),
    'lesgets-grocery': official(
      'https://res.cloudinary.com/resalocal-prod/image/upload/f_auto,q_80,c_fill,g_auto:subject,ar_3:2,w_1200/services/shops_and_services/13765/9064964',
      'Carrefour Montagne in the centre of Les Gets',
      'https://explore.lesgets.com/fr/commerces-et-services/carrefour-montagne',
      'Les Gets local guide'
    ),
    'lesgets-road-ride': official(
      'https://woody.cloudly.space/app/uploads/lesgets/2026/04/thumbs/3708/ratio_2_1/2023-06-23-velo-de-route-cptimarnold-ld-13-1920x960.webp',
      'Road cycling from Les Gets toward the local cols',
      'https://www.lesgets.com/en/bike-3/road-bike-les-gets/itineraries-and-mountain-bike-passes-les-gets/joux-plane-via-morzine/',
      'Les Gets Tourism'
    ),
    'esperance-barge': local(
      'assets/activities/esperance-iii.jpg',
      'The restored sailing barge Esperance III on Lake Annecy'
    ),
    'vboat-electric': official(
      'https://v-boat.fr/og-image.jpg',
      'A V-Boat electric rental boat on Lake Annecy',
      'https://v-boat.fr/tarifs',
      'V-Boat Annecy'
    ),
    'libellule-dinner': official(
      'https://www.bateaux-annecy.com/wp-content/uploads/2024/03/compagnie-bateaux_croisiere-dejeuner.webp',
      'A restaurant cruise aboard the Libellule on Lake Annecy',
      'https://www.bateaux-annecy.com/restaurant-cruises/dinner-cruise/',
      'Compagnie des Bateaux du Lac d\'Annecy'
    ),
    'essaonia-kayak': official(
      'https://www.essaonia.net/wp-content/uploads/2022/01/K2M-Annecy-Presentation-Copier.jpg',
      'A guided sea-kayak outing with Essaonia on Lake Annecy',
      'https://www.essaonia.net/activites/kayak-de-mer-lac-annecy-demi-journee/',
      'Essaonia'
    ),
    'wake-arena': official(
      'https://wakearena-annecy.com/wp-content/uploads/2021/02/wakesurf-1.jpg',
      'Wakesurfing with Wake Arena on Lake Annecy',
      'https://wakearena-annecy.com/',
      'Wake Arena Annecy'
    ),
    'semnoz-luge': local(
      'assets/activities/semnoz-luge.jpg',
      'A rider on the summer luge track at the Semnoz'
    ),
    'ballon-cimes': official(
      'https://ballondescimes.fr/wp-content/uploads/2023/03/Ballon-des-cimes-Panorama.jpg',
      'A Ballon des Cimes hot-air balloon flight over the Annecy region',
      'https://www.ballondescimes.fr',
      'Ballon des Cimes'
    ),
    'ulm-microlight': official(
      'https://www.deltaevasion.com/wp-content/uploads/2025/01/ulm-annecy-vol-grand-lac-646b9397.webp',
      'A Delta Evasion microlight flight over Lake Annecy',
      'https://www.deltaevasion.com/',
      'Delta Evasion'
    ),
    'vf-pollet-villard': official(
      'https://www.laclusaz.com/app/uploads/apidae/34065751-scaled.jpg',
      'Climbers on the Yves Pollet-Villard via ferrata at La Clusaz',
      'https://www.laclusaz.com/en/details/yves-pollet-villard-via-ferrata/',
      'La Clusaz Tourism'
    ),
    'climbing-initiation': official(
      'https://www.annecyguidesmontagne.com/media/cache/og_filter/2023/03/9677-5131-escalade-annecy-.jpeg',
      'An outdoor climbing lesson with the Annecy mountain guides',
      'https://www.annecyguidesmontagne.com/escalade',
      'Bureau des Guides d\'Annecy'
    ),
    'caving-diau': official(
      'https://www.terreo-canyoning.com/wp-content/uploads/2020/12/trio-la-diau-speleologie.jpg',
      'Cavers inside the Grotte de la Diau',
      'https://www.terreo-canyoning.com/activite/speleologie-la-diau-decouverte-a-annecy/',
      'Terreo Canyoning'
    ),
    'emtb-guidon': official(
      'https://www.guidonmtb.com/wp-content/uploads/2021/04/sortie-vtt-electrique.jpg',
      'A guided electric mountain-bike ride with Guidon MTB',
      'https://www.guidonmtb.com/activite/sortie-vtt-electrique/',
      'Guidon MTB'
    ),
    'vitam-aquapark': local(
      'assets/activities/vitam.jpg',
      'The indoor aquatic centre at Vitam in Neydens'
    ),
    'karting-rumilly': official(
      'https://www.kartingrumilly.fr/wp-content/uploads/2024/11/kart-rumilly.jpg',
      'Outdoor karting at Karting Evasion Rumilly',
      'https://www.kartingrumilly.fr/tarifs-location-karting-rumilly/',
      'Karting Evasion Rumilly'
    ),
    'escape-grande-evasion': official(
      'https://www.la-grande-evasion.com/wp-content/uploads/2026/05/Le-Cambriolage-du-Professeur-Jones-a-Annecy-Escape-Game.webp',
      'An escape room at La Grande Evasion in Annecy',
      'https://www.la-grande-evasion.com/annecy/',
      'La Grande Evasion'
    ),
    'menthon-chateau': official(
      'https://www.chateau-de-menthon.com/wp-content/uploads/2023/06/Vue-exterieure-chateau-nuit.-Eric-Sander-scaled.jpg',
      'Chateau de Menthon lit for an evening theatrical visit',
      'https://www.chateau-de-menthon.com/evenements/visites-nocturnes-theatralisees/',
      'Chateau de Menthon-Saint-Bernard'
    ),
    'tamie-abbey': local(
      'assets/activities/tamie-cheese.jpg',
      'Cheese made at the Abbaye de Tamie'
    ),
    'jardins-secrets': local(
      'assets/activities/jardins-secrets.jpg',
      'A carved wooden gallery inside the Jardins Secrets at Vaulx'
    ),
    'montrottier': local(
      'assets/activities/montrottier.jpg',
      'The stone towers of Chateau de Montrottier'
    ),
    'mija-food-tour': official(
      'https://en.lac-annecy.com/cache/images/34990488_apidae-ficheGallery-full.jpg',
      'A Mija food tour through old Annecy',
      'https://en.lac-annecy.com/service/mija-food-annecy/',
      'Lake Annecy Tourist Office'
    ),
    'lesgets-luge': official(
      'https://pass.lesgets.com/wp-content/uploads/2024/05/Design-sans-titre-19.png',
      'The four-season alpine coaster in Les Gets',
      'https://pass.lesgets.com/en/4-seasons-sledge/',
      'Les Gets lift pass office'
    ),
    'fantasticable': official(
      'https://static.apidae-tourisme.com/filestore/objets-touristiques/images/60/121/41974076.jpg',
      'A rider on the Fantasticable zipline in Chatel',
      'https://www.chatel.com/en/activities/the-fantasticable-in-summer-chatel/',
      'Chatel Tourism'
    ),
    'avokart': official(
      'https://www.datocms-assets.com/161817/1749633924-avokart-nikooo_r_27.jpg?fit=crop&h=832&w=1280',
      'A rider descending Avoriaz on an Avokart',
      'https://www.skipass-avoriaz.com/infos/avokart',
      'Avoriaz lift pass office'
    ),
    'aquariaz': official(
      'https://backoffice.avoriaz.com/wp-content/uploads/2025/06/Aquariaz-Avoriaz-Piscine-.png',
      'The tropical indoor pools at Aquariaz in Avoriaz',
      'https://www.avoriaz.com/en/fiche/aquariaz-tropical-paradise/',
      'Avoriaz Tourism'
    ),
    'rafting-dranse': official(
      'https://an-rafting.com/wp-content/uploads/2017/04/Raft-classique-4-e1567070727663.jpg',
      'Rafting through the Dranse gorges',
      'https://an-rafting.com/prestation/rafting-haute-savoie/',
      'AN Rafting'
    ),
    'nautichill-montriond': official(
      'https://nautichill.com/wp-content/uploads/2023/03/paddle-ponton.jpg',
      'Paddleboards at the Nautic Hill pontoon on Lac de Montriond',
      'https://nautichill.com/',
      'Nautic Hill'
    ),
    'pont-du-diable': local(
      'assets/activities/pont-diable.jpg',
      'The walkways inside the Gorges du Pont du Diable'
    ),
    'music-mecanique': official(
      'https://musicmecalesgets.org/wp-content/uploads/orgue-aeolian-03.jpg',
      'The Aeolian organ inside the Musee de la Musique Mecanique',
      'https://musicmecalesgets.org/orgue-aeolian/',
      'Musee de la Musique Mecanique'
    ),
    'obirun-biathlon': official(
      'https://www.samoens.com/wp-content/plugins/yatadata/public/multimedias/7930313/42167112-diaporama.jpg',
      'Participants running and laser shooting in the O’BIRUN biathlon session',
      'https://www.samoens.com/en/biathlon-shooting-and-running/',
      'Samoëns Tourism'
    ),
    'dranse-hydrospeed': official(
      'https://evolution2.com/media/cache/og_filter/2023/06/5735-photo-2.jpg',
      'A hydrospeed swimmer riding whitewater on the Dranse',
      'https://evolution2.com/en/thonon-geneva-lake/shared-hydrospeed-session',
      'Evolution 2 Thonon'
    ),
    'balme-aquarando': official(
      'https://www.bureaumontagnesaleve.com/images/pages/10/thumbnail/Ca_Balme_H_Courtial_14_.webp',
      'Participants floating through the rope-free Balme aquatic canyon',
      'https://www.bureaumontagnesaleve.com/activites-montagne/canyoning-randonnee-aquatique',
      'Bureau Montagne Salève'
    ),
    'back-to-bones': official(
      'https://www.back-to-bones.com/b2b/wp-content/uploads/2018/06/BTB-2018-09460-1.jpg',
      'A wakesurfer behind the Back to Bones boat on Lake Annecy',
      'https://www.back-to-bones.com/',
      'Back to Bones'
    ),
    'balme-caving': official(
      'https://www.samoens.com/wp-content/plugins/yatadata/public/multimedias/872434/1769826-diaporama.jpg',
      'A guided beginner caving group exploring the Balme cave system',
      'https://www.samoens.com/en/caving-trip-in-haute-savoie-nunayak/',
      'Samoëns Tourism'
    ),
    'giffre-airyak': official(
      'https://www.samoens.com/wp-content/plugins/yatadata/public/multimedias/124569/23934237-diaporama.jpg',
      'An inflatable Airyak paddler descending the Giffre',
      'https://www.samoens.com/en/airyak-outing-the-thrills-of-inflatable-kayaking-ecolorado/',
      'Samoëns Tourism'
    ),
    'lesgets-moto-trial': official(
      'https://static.apidae-tourisme.com/filestore/objets-touristiques/images/19/205/13028627.jpg',
      'A rider learning electric moto-trial in Les Gets',
      'https://www.lesgets.com/en/fun/things-to-do-in-les-gets/motocross-100-electric-les-gets-en-6300653/',
      'Les Gets Tourism'
    ),
    'lesgets-cani-hike': official(
      'https://static.apidae-tourisme.com/filestore/objets-touristiques/images/1/131/23233281.jpg',
      'A cani-hiker walking with a Nordic dog near Les Gets',
      'https://www.lesgets.com/commercants/cani-balade-les-gets-fr-6300473/',
      'Les Gets Tourism'
    ),
    'samoens-survival': official(
      'https://www.samoens.com/wp-content/plugins/yatadata/public/multimedias/5730903/9351738-diaporama.jpg',
      'A mountain survival group building a woodland shelter near Samoëns',
      'https://www.samoens.com/en/men-vs-wild-mountain-survival-samoens-guides-company/',
      'Samoëns Tourism'
    ),
    'fer-cheval-floor': official(
      'https://www.grand-massif.com/content/uploads/2025/11/Grand-Massif-sixt-510x710.jpg',
      'Walkers beneath the cliffs and waterfalls of the Cirque du Fer-à-Cheval',
      'https://www.grand-massif.com/en/hiking-and-mountain-huts/hiking-in-sixt-fer-a-cheval/',
      'Grand Massif'
    ),
    'giant-paddle-xl': official(
      'https://en.lac-annecy.com/cache/images-alliance/dc60245d0bee3005d2de5503cbf0f8d9_alliance-sheet-gallery-full.jpg',
      'A group balancing together on a giant XL paddleboard on Lake Annecy',
      'https://en.lac-annecy.com/activite-bookable/giant-paddle-rental-xl/',
      'Lake Annecy Tourism'
    ),
    'menthon-catamaran': official(
      'https://static.wixstatic.com/media/c1783d_2c0fc5e364a7436ead9b3657e0d5d6df~mv2.jpg/v1/crop/x_384,y_270,w_830,h_790/fill/w_410,h_395,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/IMG-20240422-WA0009.jpg',
      'A small catamaran sailing from the Menthon nautical club',
      'https://www.cnlmenthon.com/initiation',
      'Club nautique de Menthon'
    ),
    'dranse-packraft': official(
      'https://evolution2.com/media/cache/og_filter/2023/06/3380-20210907-122136.jpg',
      'Packrafters paddling a guided stretch of the Dranse',
      'https://evolution2.com/en/thonon-geneva-lake/packraft',
      'Evolution 2 Thonon'
    ),
    'veyrier-freediving': official(
      'https://www.planeteapnee.fr/wp-content/uploads/2024/06/Planete_Apnee_Ecole_Decouverte_Bapteme_Zen_Detente_2000x800px.jpg',
      'A freediving introduction with Planète Apnée in Lake Annecy',
      'https://www.planeteapnee.fr/decouvrir/',
      'Planète Apnée'
    ),
    'transparent-kayak': official(
      'https://www.glisscoolannecy.com/wp-content/uploads/2023/06/0V1A0146-1.jpg',
      'A transparent kayak over the clear water of Lake Annecy',
      'https://glisscoolannecy.com/activites/kayak-transparent/',
      'Gliss’Cool Annecy'
    ),
    'veyrier-goboat': official(
      'https://static.apidae-tourisme.com//filestore//objets-touristiques//images//104//105//39217512-liste.jpg',
      'A round electric GoBoat picnic boat on Lake Annecy',
      'https://www.ledeck-veyrier.com/en/',
      'Le Deck Veyrier'
    ),
    'alta-lumina': official(
      'https://woody.cloudly.space/app/uploads/lesgets/2026/05/thumbs/15068/ratio_2_1/2020-07-30-alta-lumina-musique-spot-selfie-lesgets-moment-factory-25-1920x960.webp',
      'The illuminated Alta Lumina forest trail in Les Gets',
      'https://www.lesgets.com/en/alta-lumina/',
      'Les Gets Tourism'
    ),
    'paccard-casting': official(
      'https://musee-paccard.com/wp-content/uploads/2021/01/musee-cloche-paccard-visite-2.jpg',
      'Visitors among the bells inside Musée Paccard in Sévrier',
      'https://musee-paccard.com/horaires-acces-musee-paccard/',
      'Musée Paccard'
    ),
    'lorette-alpage': official(
      'https://www.laclusaz.com/app/uploads/apidae/741009-diaporama-890x500.jpg',
      'A visit with cows at the working Ferme de Lorette alpage',
      'https://www.laclusaz.com/en/details/visit-to-the-ferme-de-lorette/',
      'La Clusaz Tourism'
    )
  };

  D.ACTIVITIES.forEach((activity) => {
    delete activity.media;
    if (MEDIA[activity.id]) activity.media = MEDIA[activity.id];
  });

  const allowedWithoutPhoto = new Set(['pool-bbq']);
  const missing = D.ACTIVITIES.filter((activity) => !activity.media && !allowedWithoutPhoto.has(activity.id));
  if (missing.length) console.warn('Activities missing exact media:', missing.map((activity) => activity.id));
}());
