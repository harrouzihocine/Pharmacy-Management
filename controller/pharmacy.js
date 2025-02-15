const Medicament = require("../models/medicament");
const xlsx = require("xlsx");
const Pharmacy = require("../models/pharmacy");
const Storage = require("../models/storage");
const User = require("../models/user");
const InStock = require("../models/inStock");
const PurchaseRequest = require("../models/purchaseRequest");
const moment = require("moment");
const medicamentList = [
  "STENT ACTIF 2.50*24",
  "STENT ACTIF 2.50*24",
  "STENT ACTIF 2.50*24",
  "STENT ACTIF 3.50*24",
  "STENT ACTIF 2.75*20",
  "STENT ACTIF 2.75*24",
  "STENT ACTIF 2.75*24",
  "STENT ACTIF 2.50*35",
  "STENT ACTIF 2.50*35",
  "STENT ACTIF 2.50*35",
  "STENT ACTIF 2.50*35",
  "STENT ACTIF 2.50*40",
  "STENT ACTIF 2.50*40",
  "STENT ACTIF 2.50*40",
  "STENT ACTIF 2.50*40",
  "STENT ACTIF 2.25*20",
  "STENT ACTIF 2.25*24",
  "STENT ACTIF 2.25*24",
  "STENT ACTIF 2.50*16",
  "STENT ACTIF 2.50*38",
  "STENT ACTIF 2.50*38",
  "STENT ACTIF 2.50*38",
  "STENT ACTIF 2.50*38",
  "STENT ACTIF 2.75*08",
  "STENT ACTIF 2.75*12",
  "STENT ACTIF 2.75*16",
  "STENT ACTIF 2.75*16",
  "STENT ACTIF 3.00*24",
  "STENT ACTIF 3.50*12",
  "STENT ACTIF 3.50*20",
  "STENT ACTIF 3.50*24",
  "STENT ACTIF 3.50*28",
  "STENT ACTIF 3.50*28",
  "STENT ACTIF 3.50*32",
  "STENT ACTIF 4.00*16",
  "STENT ACTIF 4.00*16",
  "STENT ACTIF 4.00*24",
  "STENT ACTIF 4.00*24",
  "STENT ACTIF 2.50*18",
  "STENT ACTIF 2.50*18",
  "STENT ACTIF 2.75*22",
  "STENT ACTIF 2.75*22",
  "STENT ACTIF 2.75*26",
  "STENT ACTIF 2.75*26",
  "STENT ACTIF 2.75*30",
  "STENT ACTIF 2.75*30",
  "STENT ACTIF 3.0*12",
  "STENT ACTIF 3.0*12",
  "STENT ACTIF 3.0*12",
  "STENT ACTIF 3.00*18",
  "STENT ACTIF 3.00*18",
  "STENT ACTIF 3.00*18",
  "STENT ACTIF 3.00*26",
  "STENT ACTIF 3.00*30",
  "STENT ACTIF 3.00*30",
  "STENT ACTIF 3.00*30",
  "STENT ACTIF 3.00*30",
  "STENT ACTIF 3.00*34",
  "STENT ACTIF 3.00*34",
  "STENT ACTIF 3.50*18",
  "STENT ACTIF 3.50*18",
  "STENT ACTIF 3.50*22",
  "STENT ACTIF 3.50*22",
  "STENT ACTIF 3.50*30",
  "STENT ACTIF 3.50*30",
  "STENT ACTIF 3.50*30",
  "STENT ACTIF 3.50*30",
  "STENT ACTIF 3.50*30",
  "STENT ACTIF 3.50*34",
  "STENT ACTIF 3.50*34",
  "STENT ACTIF 3.50*34",
  "STENT ACTIF 3.50*34",
  "STENT COUVERT 3.50*15",
  "BALLON CORONAIRE SC 1.00*20",
  "BALLON CORONAIRE SC 1.00*20",
  "BALLON CORONAIRE SC 1.50*15",
  "BALLON CORONAIRE SC 1.50*15",
  "BALLON CORONAIRE SC 1.50*20",
  "BALLON CORONAIRE SC 1.50*20",
  "BALLON CORONAIRE SC 1.50*20",
  "BALLON CORONAIRE SC 1.50*20",
  "BALLON CORONAIRE NC 2.50*12",
  "BALLON CORONAIRE NC 2.50*12",
  "BALLON CORONAIRE NC 2.50*12",
  "BALLON CORONAIRE NC 2.50*12",
  "BALLON CORONAIRE NC 2.75*08",
  "BALLON CORONAIRE NC 2.75*08",
  "BALLON CORONAIRE NC 2.75*08",
  "BALLON CORONAIRE NC 2.75*12",
  "BALLON CORONAIRE NC 2.75*12",
  "BALLON CORONAIRE NC 2.75*12",
  "BALLON CORONAIRE NC 2.75*12",
  "BALLON CORONAIRE NC 2.75*15",
  "BALLON CORONAIRE NC 2.75*15",
  "BALLON CORONAIRE NC 3.50*08",
  "BALLON CORONAIRE NC 3.50*08",
  "BALLON CORONAIRE NC 3.50*08",
  "BALLON CORONAIRE NC 3.50*10",
  "BALLON CORONAIRE NC 3.50*10",
  "BALLON CORONAIRE NC 4.50*08",
  "BALLON CORONAIRE NC 4.50*08",
  "BALLON CORONAIRE NC 4.50*12",
  "BALLON CORONAIRE NC 4.50*12",
  "BALLON CORONAIRE NC 4.00*15",
  "BALLON CORONAIRE NC 2.75*25",
  "BALLON CORONAIRE NC 2.75*25",
  "BALLON CORONAIRE NC 2.75*25",
  "BALLON CORONAIRE NC 2.75*25",
  "BALLON CORONAIRE NC 3.50*20",
  "BALLON CORONAIRE NC 4.00*15",
  "BALLON CORONAIRE NC 4.00*20",
  "BALLON CORONAIRE NC 4.00*20",
  "IOPROMIDE INJ 300MG/ML FL/100ML",
  "CHLORURE DE SODIUM INJ 0,9% FL/500ML",
  "GANT CHIRURGICAL STERILE 7,5 BT 50",
  "GANT CHIRURGICAL STERILE 8 BT 50",
  "PROLONGATEUR HP 150CM FIN",
  "SERINGUE JETABLE 10 CC BT 100",
  "CATHETER VEINEUX CENTRAL TRIPLE LUMIERE 7FR",
  "SERINGUE JETABLE 2.5 ML BT100",
  "SERINGUE JETABLE 2.5 ML BT100",
  "SERINGUE JETABLE 50 CC LUER-LOCK BT 30",
  "LIDOCAINE INJ 2% 10ML",
  "CASAQUE XXL STERICLEAN",
  "TROUSSE UNIVESSELLE CONDEMED",
  "TROUSSE D'ANGEOGRAPHIE",
  "INTRANULE G18 VERT",
  "INTRANULE G22 BLEU",
  "ACETYLSALICYLATE DE LYSINE INJ IM-IV 900MG",
  "HYDROCORTISONE INJ 100 MG HHC",
  "NORADRENALINE TARTRATE INJ 8MG/4ML",
  "NORADRENALINE TARTRATE INJ 8MG/4ML",
  "FUROSEMIDE INJ 20MG/2ML",
  "METOCLOPRAMIDE INJ 10MG",
  "AMIODARONE INJ 150MG AMP/3ML",
  "ATROPINE PURE INJ 0,25MG/ML",
  "ATROPINE PURE INJ 1MG/ML",
  "EPHEDRINE CHLORHYDRATE INJ 3% AMP/1ML",
  "MAGNESIUM SULFATE INJ 15%",
  "MIDAZOLAM INJ 15MG/3ML",
  "ADRENALINE INJ 1MG/ML",
  "ELASTO 10 CM",
  "LUNETTE A OXYGENE ADULTE",
  "INTRODUCTEUR DESILE  RADIAL 6F 11CM",
  "INTRODUCTEUR DESILE  FEMORAL 6F 11 CM",
  "INTRODUCTEUR DESILE  RADIAL 5F 11 CM",
  "GUIDE 0.035 EN J 150CM BOSTON STARTER",
  "KIT INFLATION AVEC PUSH PULL Y ET EXTENSION LINE ET STOP COCK",
  "KIT INFLATION ENCORE INFLATEUR",
  "GUIDING CATHE LAUNCHER 6F AL1.0",
  "GUIDING CATHE LAUNCHER 6F AL1.0",
  "GUIDING CATHE LAUNCHER 6F AL2.0",
  "GUIDING CATHE LAUNCHER 6F AR1,0",
  "GUIDING CATHE LAUNCHER 6F AR2,0",
  "GUIDING CATHE LAUNCHER 6F JR 3,5",
  "GUIDING CATHE LAUNCHER 6F EBU 3,75",
  "GUIDING CATHE LAUNCHER 6F EBU 3,5",
  "SONDE DIAGNOSTIC FL 3,5 5 F 100 CM",
  "SONDE DIAGNOSTIC FL 3,5 5 F 100 CM",
  "SONDE DIAGNOSTIC FR 4.0 5 F 100 CM",
  "SONDE DIAGNOSTIC FR 4.0 5 F 100 CM",
  "GUIDE 0,014 ASAHI GAIA THIRD",
  "GUIDE 0,014 ASAHI RINATO",
  "GUIDE 0,014 ASAHI GAIA THIRD",
  "GUIDE 0,014 ASAHI GAIA THIRD",
  "GUIDE 0,014 ASAHI FIELDER XT 190CM",
  "GUIDE 0,014 ASAHI FIELDER XT 190CM",
  "GUIDE 0,014 ASAHI SOFT",
  "GUIDE 0,014 ASAHI FIELDER XT 190CM",
  "SONDE DIAGNOSTIC FL 3,5 5 F 100 CM",
  "SONDE DIAGNOSTIC FL 3,5 5 F 100 CM",
  "SONDE DIAGNOSTIC FL 3,5 5 F 100 CM",
  "SONDE DIAGNOSTIC FL 3,5 5 F 100 CM",
  "SONDE DIAGNOSTIC FL 3,5 5 F 100 CM",
  "SONDE DIAGNOSTIC FL 3,5 5 F 100 CM",
  "SONDE DIAGNOSTIC FR 4.0 5 F 100 CM",
  "SONDE DIAGNOSTIC FR 4.0 5 F 100 CM",
  "SONDE DIAGNOSTIC FR 4.0 5 F 100 CM",
  "SONDE DIAGNOSTIC FR 4.0 5 F 100 CM",
  "GUIDING CATHE LAUNCHER 6F JR 3,5",
  "GUIDING CATHE LAUNCHER 6F JR 3,5",
  "GUIDING CATHE LAUNCHER 6F JR4,0",
  "GUIDING CATHE LAUNCHER 6F JR4,0",
  "GUIDING CATHE LAUNCHER 6F AR2,0",
  "GUIDING CATHE LAUNCHER 6F AL1,5",
  "GUIDING CATHE LAUNCHER 6F AL2.0",
  "GUIDING CATHE LAUNCHER 6F JR 3,5",
  "GUIDING CATHE LAUNCHER 6F JR 3,5",
  "GUIDING CATHE LAUNCHER 6F EBU 3,75",
  "GUIDING CATHE LAUNCHER 6F EBU 3,75",
  "GUIDING CATHE LAUNCHER 6F AL2.0",
  "GUIDING CATHE LAUNCHER 6F EBU 3,5",
  "GUIDING CATHE LAUNCHER 6F EBU 3,5",
  "GUIDING CATHE LAUNCHER 6F EBU 3,5",
  "INTRODUCTEUR DESILE  RADIAL 6F 11CM",
  "INTRODUCTEUR DESILE  RADIAL 5F 11 CM",
  "SONDE DIAGNOSTIC FR 3,5 5 F 100 CM",
  "GUIDE 0.035 EN J 150CM BOSTON STARTER",
  "GUIDE 0.035 EN J 150CM BOSTON STARTER",
  "GUIDE 0,014 ASAHI RINATO",
  "GUIDE 0,014 ASAHI SOFT",
  "KIT INFLATION AVEC PUSH PULL Y ET EXTENSION LINE ET STOP COCK",
  "ACIDE ASCORBIQUE SOL.INJ 500MG",
  "SODIUM CHLORURE INJ 10% AMP/10ML",
  "MASQUE CHIRURGICAL 3 PLIS 'A ELASTIQUE' BAVETTE",
  "FENTANYL CITRATE INJ 0.5MG/10ML",
  "SODIUM CHLORURE INJ 10% AMP/10ML",
  "POTASSIUM CHLORURE INJ 10% AMP/10ML",
  "FENTANYL CITRATE INJ 0.5MG/10ML",
  "MORPHINE CHLORHYDRATE INJ 1% 10MG/1ML",
  "MORPHINE CHLORHYDRATE INJ 1% 10MG/1ML",
  "SUFENTANIL INJ 250µG/5ML",
  "ALFENTANIL INJ 5MG/10ML",
  "ALCOOL CHIRURGICAL 70 ° FL/1L",
  "POLYVIDONE IODEE 4% FL/125ML",
  "POLYVIDONE IODEE 10% FL/1L",
  "EAU OXYGENEE 10V 1L",
  "DAKIN FL 1L",
  "MAGNESIUM SULFATE INJ 15%",
  "SODIUM BICARBONATE INJ 8,4% AMP/10ML",
  "DRAIN DE KHER LATEX CH 16",
  "SONDE DE CYSTOSTOMIE - SUSPUBIENN",
  "SONDE DE PEZZER 12FR",
  "SONDE DE PEZZER 14FR",
  "SONDE DE PEZZER 16FR",
  "SONDE DE PEZZER 18FR",
  "SONDE DE CYSTOSTOMIE - SUSPUBIENN",
  "SONDE RECTALE 20 JAUNE",
  "SONDE RECTALE CH26",
  "SONDE RECTALE 28 VERT",
  "LIDOCAINE VISQUEUSE GEL 2%",
  "POTASSIUM GLUCONATE SANS SUCRE SIROP 15% FL/120ML",
  "NIFLUMATE 700MG SUPPO",
  "PARACETAMOL SUPPO 200MG",
  "PARACETAMOL SUPPO 150MG",
  "PARACETAMOL SUPPO 300MG",
  "DICLOFENAC 100MG SUPPO",
  "DOXALAX GEL RECTAL 10 G",
  "LIDOCAINE VISQUEUSE GEL 2%",
  "TROLAMINE 93G",
  "TROLAMINE 190G",
  "ACIDE FUCIDIQUE 2% POMMADE",
  "ATORVASTATINE 80MG CP",
  "ATORVASTATINE 40MG CP",
  "LEVOTHYROXINE SODIQUE 100µG COMPRIME",
  "LEVOTHYROXINE SODIQUE 75µG COMPRIME",
  "LEVOTHYROXINE SODIQUE 25µG COMPRIME",
  "TRIATEC 2,5 MG BTE 28 COMP",
  "TRIATEC 5 MG BT 28 COMP",
  "TRIATEC 1,25 MG BTE 28 COMP",
  "MOLSIDOMINE 2MG CP",
  "COLCHIMED 1 MG COLCHICINE BT 20 COMP",
  "AMIODARONE 200MG COMPRIME",
  "FUROSEMIDE COMPRIME 40MG",
  "PHLOROGLUCINOL 160MG CP",
  "ATENOR ATENOLOL COMP 100 MG BT 30 COMPRIME",
  "PLAVIX COMP 75 MG BTE 28 COMPRIME",
  "NICARDIPINE LP 50MG CP",
  "AMLODIPINE 5MG GELULE",
  "ACEBUTOLOL 200MG COMPRIME",
  "METFORMINE 850MG CP",
  "BISOPROLOL 5MG CP",
  "BISOPROLOL 10MG CP",
  "METFORMINE 850MG CP",
  "BISOPROLOL 5MG CP",
  "POTASSIUM CHLORURE INJ 10% AMP/10ML",
  "CALCIUM CHLORURE INJ IV 10% AMP/10ML",
  "SODIUM CHLORURE INJ 10% AMP/10ML",
  "SONDE DE FOLEY (ENFANT) 6 VISICALE URINAIRE",
  "SONDE DE FOLEY (ENFANT) 10 VISICALE URINAIRE",
  "SONDE DE FOLEY (HOMME) 14 VISICALE URINAIRE",
  "SONDE DE FOLEY (HOMME) 16 VISICALE URINAIRE",
  "SONDE DE FOLEY (HOMME) 18 VISICALE URINAIRE",
  "SONDE DE FOLEY (FEMME) 18 VISICALE URINAIRE",
  "SONDE DE FOLEY (FEMME) 14 VISICALE URINAIRE",
  "SONDE DE FOLEY (HOMME) 24 3 VOIES VISICALE URINAIRE",
  "SONDE DE FOLEY (HOMME) 22 3 VOIES VISICALE URINAIRE",
  "SONDE DE FOLEY (HOMME) 24 3VOIES VISICALE URINAIRE SILICONE",
  "SONDE DE FOLEY (HOMME) 22 3VOIES VISICALE URINAIRE SILICONEE",
  "ATROPINE PURE INJ 1MG/ML",
  "ATROPINE PURE INJ 0,25MG/ML",
  "ETAMSYLATE DICYNONE SOL INJ 250MG/2ML",
  "DOPAMINE INJ 200MG/5ML",
  "ADRENALINE INJ 1MG/ML",
  "AMIODARONE INJ 150MG AMP/3ML",
  "TRIAMCINOLONE ACETONIDE INJ 40MG/ML",
  "HEPARINE CALCIQUE 12500UI/0,5ML SOL INJ SC",
  "CEFTRIAXONE INJ IV 1G",
  "ACETYLSALICYLATE DE LYSINE INJ IM-IV 900MG",
  "AMOXICILLINE INJ 1G",
  "CALCIUM CHLORURE INJ IV 10% AMP/10ML",
  "OMEPRAZOLE INJ IV 40MG",
  "CEFAZOLINE INJ IV-IM 1G",
  "IMIPENEM/CILASTATINE INJ 500MG/500MG",
  "VANCOMYCINE INJ 500 MG",
  "PROPOFOL INJ IV 200MG/20ML",
  "CEFOTAXIME INJ IV 1G",
  "COUCHE ADULTE LARG NOVA P/8",
  "BUPRENORPHINE INJ 0,3MG/ML INJ",
  "EPHEDRINE CHLORHYDRATE INJ 3% AMP/1ML",
  "NEOSTIGMINE INJ 0.5MG/ML",
  "NALOXONE SOL.INJ 0,4MG/ML BT 10 AMP",
  "PHENOBARBITAL INJ 40MG/2ML",
  "MIDAZOLAM INJ 15MG/3ML",
  "MIDAZOLAM INJ 15MG/3ML",
  "DIAZEPAM INJ 10MG/2ML",
  "PHENOBARBITAL 100MG CP",
  "PROPOFOL INJ IV 200MG/20ML",
  "ACIDE TRANEXAMIQUE INJ 500MG/5 ML",
  "ACIDE TRANEXAMIQUE INJ 500MG/5 ML",
  "ETOMIDATE INJ IV 2MG/ML",
  "FUROSEMIDE INJ 20MG/2ML",
  "FUROSEMIDE INJ 20MG/2ML",
  "DEXAMETHASONE PHOS SODIQUE INJ 4MG/ML",
  "DEXAMETHASONE PHOS SODIQUE INJ 4MG/ML",
  "HYDROCORTISONE INJ 100 MG HHC",
  "DICLOFENAC 75MG/2ML",
  "FUROSEMIDE INJ 250MG",
  "DIGOXIN INJ 0,5MG/2ML BT 5 AMP",
  "HEPARINE SODIQUE SOL.INJ 25000UI/5ML",
  "HEPARINE SODIQUE SOL.INJ 25000UI/5ML",
  "DOBUTAMINE INJ 250MG/20ML",
  "METHYLPREDNISOLONE INJ 40MG",
  "METHYLPREDNISOLONE INJ 40MG",
  "METHYLPREDNISOLONE INJ 20 MG",
  "KETOPROFENE INJ 100MG",
  "METOCLOPRAMIDE INJ 10MG",
  "GENTAMICINE INJ 80MG 2ML",
  "GENTAMICINE INJ 80MG 2ML",
  "PHLOROGLUCINOL INJ 10MG/ML",
  "ENOXAPARINE SODIQUE INJ SC 8000UI FL/0.8ML",
  "ENOXAPARINE SODIQUE INJ SC 6000UI FL/0.6ML",
  "ENOXAPARINE SODIQUE INJ SC 4000UI FL/0.4ML",
  "CEFAZOLINE INJ IV-IM 1G",
  "CEFAZOLINE INJ IV-IM 1G",
  "NEFOPAM CHLORHYDRATE INJ IM-IV 20MG/2ML",
  "NORADRENALINE TARTRATE INJ 8MG/4ML",
  "SEVOFLURANE LIQUIDE P/INHALATION FL/250ML",
  "HYDROXYZINE 25MG CP",
  "BANDE RESINE N°2 5 CM",
  "BANDE RESINE N°3 7,5 CM",
  "BANDE RESINE N°4 10 CM",
  "BANDE RESINE N°5 12,5 CM",
  "FILM FUJIFILM 20*25 BT 150 SH",
  "FILM FUJIFILM 35*43 BT 100",
  "PAPIER ECHOGRAPHIE MITSUBISHI",
  "PENIFLOW / U",
  "PROPOFOL INJ IV 200MG/20ML",
  "CLARISCON 10ML",
  "ETOMIDATE INJ IV 2MG/ML",
  "ATROPINE PURE INJ 1MG/ML",
  "ATROPINE PURE INJ 0,25MG/ML",
  "GADOBUTROL INJ 604,72MG/ML FL/15ML",
  "NEOSTIGMINE INJ 0.5MG/ML",
  "LIDOCAINE VISQUEUSE GEL 2%",
  "GADOTERATE DE MEGLUMINE FL/10ML",
  "ACIDE TRANEXAMIQUE INJ 500MG/5 ML",
  "GADOTERATE DE MEGLUMINE FL/10ML",
  "EPHEDRINE CHLORHYDRATE INJ 3% AMP/1ML",
  "NALOXONE SOL.INJ 0,4MG/ML BT 10 AMP",
  "BUPIVACAINE SOL.INJ.0,5% F/20ML",
  "GADOTERATE DE MEGLUMINE FL/20ML",
  "LIDOCAINE INJ 2% 10ML",
  "GADOTERATE DE MEGLUMINE FL/15ML",
  "POTASSIUM CHLORURE INJ 10% AMP/10ML",
  "FUROSEMIDE INJ 20MG/2ML",
  "GEL ECHO 5L",
  "DEXAMETHASONE PHOS SODIQUE INJ 4MG/ML",
  "CANULE DE GUEDEL N1 7CM",
  "HYDROCORTISONE INJ 100 MG HHC",
  "METHYLPREDNISOLONE INJ 40MG",
  "CANULE DE GUEDEL N1 7CM",
  "METHYLPREDNISOLONE INJ 20 MG",
  "CANULE DE GUEDEL N0 6CM",
  "NICARDIPINE INJ IV 10MG/10ML",
  "GENTAMICINE INJ 80MG 2ML",
  "CEFAZOLINE INJ IV-IM 1G",
  "FUROSEMIDE INJ 250MG",
  "CANULE DE GUEDEL N2 8CM",
  "NORADRENALINE TARTRATE INJ 8MG/4ML",
  "CANULE DE GUEDEL N3 9CM",
  "KETOPROFENE INJ 100MG",
  "SUFENTANIL INJ 250µG/5ML",
  "SONDE ENDOTRACHEALE ADULT 5,5",
  "ALFENTANIL INJ 5MG/10ML",
  "SONDE ENDOTRACHEALE ADULT 5",
  "FENTANYL CITRATE INJ 0.5MG/10ML",
  "SONDE ENDOTRACHEALE ADULT 6",
  "MIDAZOLAM INJ 15MG/3ML",
  "SONDE ENDOTRACHEALE ADULT 6",
  "NEFOPAM CHLORHYDRATE INJ IM-IV 20MG/2ML",
  "AIGUILLE A / PONCTION LOMBAIRE LONGUEUR (88mm X 0,53mm) 25G",
  "AIGUILLE A / PONCTION LOMBAIRE LONGUEUR (88mm X 0,4mm) 27G",
  "INTRANULE G18 VERT",
  "INTRANULE G20 ROSE",
  "INTRANULE G22 BLEU",
  "INTRANULE G16 GRIS",
  "INTRANULE G24 JAUNE",
  "GANT D EXAMEN M /BT 100",
  "SONDE ENDOTRACHEALE ADULT 7",
  "SONDE ENDOTRACHEALE ADULT 7",
  "SONDE ENDOTRACHEALE ADULT 7,5",
  "SONDE ENDOTRACHEALE ADULT 7,5",
  "SONDE ENDOTRACHEALE ADULT 8",
  "SONDE ENDOTRACHEALE PEDIATRIQUE 2,5",
  "SONDE ENDOTRACHEALE PEDIATRIQUE 2,5",
  "SONDE ENDOTRACHEALE ADULT 3",
  "SONDE ENDOTRACHEALE PEDIATRIQUE 3,5",
  "SONDE ENDOTRACHEALE ADULT 3",
  "SERINGUE JETABLE 10 CC BT 100",
  "SONDE ENDOTRACHEALE PEDIATRIQUE 4",
  "SERINGUE JETABLE 20 CC A VISE LUER-LOK",
  "CANULE DE GUEDEL N00 5CM",
  "SERINGUE JETABLE 1 CC (A INSULINE) BT 100",
  "FORMOL 37%",
  "POCHE DE KARAYA S/SUPPORT COLOSTOMIE",
  "KIT PERIDURALE 18G PRIX 1450,00",
  "LAME DE BISTOURI 23 BT 100 U",
  "LAME DE BISTOURI 15 BT 100 U",
  "LAME DE BISTOURI 24 BT 100 U",
  "AIGUILLE DE NEUROSTIMULATION 20G L/150MM",
  "AIGUILLE DE NEUROSTIMULATION 22G L/50MM",
  "SERINGUE JETABLE 2.5 ML BT100",
  "AIGUILLE A / PONCTION LOMBAIRE LONGUEUR (75mm X 0,9mm) 20G",
  "SPARADRAP 10*10",
  "COMPRESSE 7,5*7,5 CM BT/100",
  "AIGUILLE A / PONCTION LOMBAIRE LONGUEUR (88mm X 0,53mm) 25G",
  "SONDE ENDOTRACHEALE ADULT 7",
  "AIGUILLE A / PONCTION LOMBAIRE LONGUEUR (88mm X 0,4mm) 27G",
  "AIGUILLE A / PONCTION LOMBAIRE LONGUEUR (88mm X 0,4mm) 27G",
  "SONDE ENDOTRACHEALE ADULT 6.5",
  "ABAISSE LANGUE A USAGE UNIQUE",
  "SONDE ENDOTRACHEALE ADULT 7,5",
  "BANDELETTES DEXTRO",
  "SONDE ENDOTRACHEALE ADULT 5,5",
  "COLLECTEUR D'URINE A/DISP.VID.2L",
  "SONDE ENDOTRACHEALE ADULT 5",
  "SONDE ENDOTRACHEALE ADULT 6",
  "GANT CHIRURGICAL STERILE 7 BT 50",
  "SONDE ENDOTRACHEALE PEDIATRIQUE 3,5",
  "SONDE ENDOTRACHEALE ADULT 3",
  "GANT CHIRURGICAL STERILE 7,5 BT 50",
  "SONDE ENDOTRACHEALE PEDIATRIQUE 2,5",
  "GANT CHIRURGICAL STERILE 8 BT 50",
  "PERFUSEUR",
  "GANT CHIRURGICAL STERILE 6,5 BT 50",
  "PROLONGATEUR HP 100CM FIN",
  "GANT D EXAMEN L /BT 100",
  "SONDE GASTRIQUE 18 GAVAGE",
  "GANT D EXAMEN L /BT 100",
  "SONDE GASTRIQUE 20 GAVAGE",
  "SONDE GASTRIQUE 16 GAVAGE",
  "GANT D EXAMEN L /BT 100",
  "GANT D EXAMEN M /BT 100",
  "ROCURONIUM BROMURE INJ 50MG/5ML",
  "GANT D EXAMEN M /BT 100",
  "VECURONIUM BROMURE INJ IV 4MG/ML",
  "GANT D EXAMEN S /BT 100",
  "OXYTOCINE INJ 5UI/1ML",
  "COLLE PROTEINEE + THROMBINE HUMAINE 2ML",
  "GLUCAGON INJ 1MG",
  "CHAUX SODEE",
  "PARACETAMOL CHLORHYDRATE INJ 10MG/ML FL/100ML",
  "SERINGUE INJECTEUR 190 ML",
  "GLUCOSE INJ.5%FL/500ML SGI",
  "CHLORURE DE SODIUM INJ 0,9% FL/500ML",
  "SAC DASRI JAUNE 60 KG /PAQ 30",
  "SOLUTION DE RINGER LACTATE INJ 500ML",
  "SAC DASRI JAUNE 30 KG /PAQ 30",
  "GLUCOSE INJ 10% FL/500ML",
  "SAC DASRI JAUNE 100 L /PAQ 10",
  "CONTENAIRE D'AIGUILLE COLECTEUR 04 LITRE",
  "CONTENAIRE D'AIGUILLE COLECTEUR 6 LITRE",
  "CONTENAIRE D'AIGUILLE COLECTEUR 12 LITRE",
  "BANDE A GAZ 8 CM",
  "COTON CARDE 500 GR SOCOTIDE",
  "COTON HYDROPHIL 500 GR COTIFLEX",
  "FIL RESORBABLE 0 36MM ROND BT 36",
  "FIL RESORBABLE 1 48MM ROND BT 36",
  "FIL RESORBABLE 1 36MM ROND BT 36",
  "FIL RESORBABLE 1 40MM ROND BT 36",
  "FIL RESORBABLE 2 40MM ROND BT 36",
  "FIL RESORBABLE 0 36MM ROND BT 36",
  "FIL RESORBABLE 2/0 26MM ROND BT 36",
  "FIL RESORBABLE 5/0 26MM ROND BT 36",
  "FIL RESORBABLE 4/0 26MM ROND BT 36",
  "FIL RESORBABLE 0 26MM ROND BT 36",
  "FIL RESORBABLE 1 36MM TRIANG BT 36",
  "FIL RESORBABLE BOBINE 0 250 CM BT 24",
  "FIL RESORBABLE BOBINE 2/0 250 CM BT 24",
  "FIL RESORBABLE BOBINE 3/0 250 CM BT 24",
  "FIL RESORBABLE BOBINE 3/0 250 CM BT 24",
  "IOHEXOL INJ 350MG/ML FL/100ML",
  "IOHEXOL INJ 300MG/ML FL/100ML",
  "IOPROMIDE INJ 370MG/ML FL/50ML",
  "IOPROMIDE INJ 300MG/ML FL/50ML",
  "PARACETAMOL CHLORHYDRATE INJ 10MG/ML FL/100ML",
  "CIPROFLOXACINE 200 MG INJ IV F/100",
  "CHLORURE DE SODIUM INJ 0,9% FL/3L",
  "BANDE DE CREPE 4M X 10CM VELPOAU",
  "INTRANULE G20 ROSE",
  "INTRANULE G18 VERT",
  "INTRANULE G22 BLEU",
  "SERINGUE JETABLE 2.5 ML BT100",
  "MASQUE CHIRURGICAL 3 PLIS 'A ELASTIQUE' BAVETTE",
  "TROUSSE UNIVESSELLE CONDEMED",
  "FLACON DE REDAN 400 ML",
  "PERFUSEUR",
  "GAZE HYDROPHILE 100M X 60CM",
  "COMPRESSE 10*10 CM BT/100",
  "COMPRESSE 7,5*7,5 CM BT/100",
  "COUCHE ADULTE LARG NOVA P/8",
  "SERINGUE JETABLE 10 CC BT 100",
  "SERINGUE JETABLE 10 CC BT 100",
  "SERINGUE INJECTEUR 200/100 ML AVEC TUBULEUR DOUBLE TETE",
  "SERINGUE JETABLE 1 CC (A INSULINE) BT 100",
  "BANDE DE CREPE 4M X 20CM VELPOAU",
  "SERINGUE JETABLE 50 CC A GAVAGE BT 30",
  "SERINGUE JETABLE 50 CC A GAVAGE BT 30",
  "CASAQUE XXL STERICLEAN",
  "CASAQUE XL STERICLEAN",
  "CASAQUE XXXL STERICLEAN",
  "SURFA-SOFT FL/750ML",
  "TROUSSE CEC STERICLEAN",
  "PROLONGATEUR HP 100CM FIN",
  "PROLONGATEUR HP 150CM",
  "PROLONGATEUR BP 150CM",
  "CHAMP DE TABLE 127*228 CM",
  "CHAMP A INCISER 38,45,60/48*60 PM",
  "CHAMP A INCISER 38,45,90/48*90 GM",
  "MASQUE A OXYGENE ENFANT",
  "MASQUE A OXYGENE ADULT",
  "LUNETTE A OXYGENE ADULTE",
  "CHAMP STERIL 75/90",
  "SAVON DOUX",
  "STERANIOS 2% DESCOTON",
  "SUR CHAUSSURE",
  "HEXANIOS",
  "DESCOSEPT SPEZIAL FL/1L",
  "ANIOS DVA HPH",
  "CHARLOTTE",
  "KIT DE DIALYSE",
  "CATHETER CENTRALE",
  "CAGOULE BOITE DE 40",
  "PATCH ECG",
  "ROULEAUX TEMOIN GAZ",
  "ETIQUETTE TEMOIN",
  "GAINE DE STERILISATION 42 CM",
  "GAINE DE STERILISATION 30 CM",
  "GAINE DE STERILISATION 27 CM",
  "GAINE DE STERILISATION 15 CM",
  "PAPIER CREPE 1M*1M",
  "INTRANULE G14 ORANGE",
  "AIGUILLE A / PONCTION LOMBAIRE LONGUEUR (88mm X 0,53mm) 25G",
  "AIGUILLE A / PONCTION LOMBAIRE LONGUEUR (88mm X 0,4mm) 27G",
  "INTRANULE G18 VERT",
  "INTRANULE G20 ROSE",
  "INTRANULE G22 BLEU",
  "INTRANULE G16 GRIS",
  "INTRANULE G24 JAUNE",
  "GANT D EXAMEN M /BT 100",
  "SONDE ENDOTRACHEALE ADULT 7",
  "SONDE ENDOTRACHEALE ADULT 7",
  "SONDE ENDOTRACHEALE ADULT 7,5",
  "SONDE ENDOTRACHEALE ADULT 7,5",
  "SONDE ENDOTRACHEALE ADULT 8",
  "SONDE ENDOTRACHEALE PEDIATRIQUE 2,5",
  "SONDE ENDOTRACHEALE PEDIATRIQUE 2,5",
  "SONDE ENDOTRACHEALE ADULT 3",
  "SONDE ENDOTRACHEALE PEDIATRIQUE 3,5",
  "SONDE ENDOTRACHEALE ADULT 3",
  "SERINGUE JETABLE 10 CC BT 100",
  "SONDE ENDOTRACHEALE PEDIATRIQUE 4",
  "SERINGUE JETABLE 20 CC A VISE LUER-LOK",
  "CANULE DE GUEDEL N00 5CM",
  "SERINGUE JETABLE 1 CC (A INSULINE) BT 100",
  "FORMOL 37%",
  "POCHE DE KARAYA S/SUPPORT COLOSTOMIE",
  "KIT PERIDURALE 18G PRIX 1450,00",
  "LAME DE BISTOURI 23 BT 100 U",
  "LAME DE BISTOURI 15 BT 100 U",
  "LAME DE BISTOURI 24 BT 100 U",
  "AIGUILLE DE NEUROSTIMULATION 20G L/150MM",
  "AIGUILLE DE NEUROSTIMULATION 22G L/50MM",
  "SERINGUE JETABLE 2.5 ML BT100",
  "AIGUILLE A / PONCTION LOMBAIRE LONGUEUR (75mm X 0,9mm) 20G",
  "SPARADRAP 10*10",
  "COMPRESSE 7,5*7,5 CM BT/100",
  "AIGUILLE A / PONCTION LOMBAIRE LONGUEUR (88mm X 0,53mm) 25G",
  "SONDE ENDOTRACHEALE ADULT 7",
  "AIGUILLE A / PONCTION LOMBAIRE LONGUEUR (88mm X 0,4mm) 27G",
  "AIGUILLE A / PONCTION LOMBAIRE LONGUEUR (88mm X 0,4mm) 27G",
  "SONDE ENDOTRACHEALE ADULT 6.5",
  "ABAISSE LANGUE A USAGE UNIQUE",
  "SONDE ENDOTRACHEALE ADULT 7,5",
  "BANDELETTES DEXTRO",
  "SONDE ENDOTRACHEALE ADULT 5,5",
  "COLLECTEUR D'URINE A/DISP.VID.2L",
  "SONDE ENDOTRACHEALE ADULT 5",
  "SONDE ENDOTRACHEALE ADULT 6",
  "GANT CHIRURGICAL STERILE 7 BT 50",
  "SONDE ENDOTRACHEALE PEDIATRIQUE 3,5",
  "SONDE ENDOTRACHEALE ADULT 3",
  "GANT CHIRURGICAL STERILE 7,5 BT 50",
  "SONDE ENDOTRACHEALE PEDIATRIQUE 2,5",
  "GANT CHIRURGICAL STERILE 8 BT 50",
  "PERFUSEUR",
  "GANT CHIRURGICAL STERILE 6,5 BT 50",
  "PROLONGATEUR HP 100CM FIN",
  "GANT D EXAMEN L /BT 100",
  "SONDE GASTRIQUE 18 GAVAGE",
  "GANT D EXAMEN L /BT 100",
  "SONDE GASTRIQUE 20 GAVAGE",
  "SONDE GASTRIQUE 16 GAVAGE",
  "GANT D EXAMEN L /BT 100",
  "GANT D EXAMEN M /BT 100",
  "ROCURONIUM BROMURE INJ 50MG/5ML",
  "GANT D EXAMEN M /BT 100",
  "VECURONIUM BROMURE INJ IV 4MG/ML",
  "GANT D EXAMEN S /BT 100",
  "OXYTOCINE INJ 5UI/1ML",
  "COLLE PROTEINEE + THROMBINE HUMAINE 2ML",
  "GLUCAGON INJ 1MG",
  "CHAUX SODEE",
  "PARACETAMOL CHLORHYDRATE INJ 10MG/ML FL/100ML",
  "SERINGUE INJECTEUR 190 ML",
  "GLUCOSE INJ.5%FL/500ML SGI",
  "CHLORURE DE SODIUM INJ 0,9% FL/500ML",
  "SAC DASRI JAUNE 60 KG /PAQ 30",
  "SOLUTION DE RINGER LACTATE INJ 500ML",
  "SAC DASRI JAUNE 30 KG /PAQ 30",
  "GLUCOSE INJ 10% FL/500ML",
  "SAC DASRI JAUNE 100 L /PAQ 10",
  "CONTENAIRE D'AIGUILLE COLECTEUR 04 LITRE",
  "CONTENAIRE D'AIGUILLE COLECTEUR 6 LITRE",
  "CONTENAIRE D'AIGUILLE COLECTEUR 12 LITRE",
  "BANDE A GAZ 8 CM",
  "COTON CARDE 500 GR SOCOTIDE",
  "COTON HYDROPHIL 500 GR COTIFLEX",
  "FIL RESORBABLE 0 36MM ROND BT 36",
  "FIL RESORBABLE 1 48MM ROND BT 36",
  "FIL RESORBABLE 1 36MM ROND BT 36",
  "FIL RESORBABLE 1 40MM ROND BT 36",
  "FIL RESORBABLE 2 40MM ROND BT 36",
  "FIL RESORBABLE 0 36MM ROND BT 36",
  "FIL RESORBABLE 2/0 26MM ROND BT 36",
  "FIL RESORBABLE 5/0 26MM ROND BT 36",
  "FIL RESORBABLE 4/0 26MM ROND BT 36",
  "FIL RESORBABLE 0 26MM ROND BT 36",
  "FIL RESORBABLE 1 36MM TRIANG BT 36",
  "FIL RESORBABLE BOBINE 0 250 CM BT 24",
  "FIL RESORBABLE BOBINE 2/0 250 CM BT 24",
  "FIL RESORBABLE BOBINE 3/0 250 CM BT 24",
  "SURGICEL 10*20 ETHICON",
  "GANT CHIRURGICAL STERILE 8 BT 50",
  "GANT CHIRURGICAL STERILE 7,5 BT 50",
  "GANT CHIRURGICAL STERILE 7 BT 50",
  "GANT CHIRURGICAL STERILE 6,5 BT 50",
  "COLLECTEUR D'URINE A/DISP.VID.2L",
  "SAC DASRI JAUNE 30 KG /PAQ 30",
  "SAC DASRI JAUNE 100 L /PAQ 10",
  "CASAQUE XL STERICLEAN",
  "SONDE DE FOLEY (HOMME) 16 VISICALE URINAIRE",
  "SONDE DE FOLEY (HOMME) 18 VISICALE URINAIRE",
  "SONDE DE FOLEY (FEMME) 18 VISICALE URINAIRE",
  "SONDE DE FOLEY (FEMME) 12 VISICALE URINAIRE",
  "SONDE DE FOLEY (HOMME) 22 3 VOIES VISICALE URINAIRE",
  "SONDE GASTRIQUE 18 GAVAGE",
  "SONDE RECTALE 20 JAUNE",
  "SONDE RECTALE 28 VERT",
  "SONDE RECTALE CH26",
  "SONDE ASPIRATION 14 ADULT VERT",
  "SONDE ASPIRATION 08 PEDIATRIQUE BLEU",
  "SONDE ASPIRATION 18 ADULT ROUGE",
  "SONDE ASPIRATION 10 PEDIATRIQUE NOIR",
  "SONDE ASPIRATION 16 ADULT ORANGE",
  "DRAIN DE REDON CH 10",
  "DRAIN DE REDON CH 14",
  "DRAIN DE REDON CH 16",
  "DRAIN DE REDON CH 18",
  "DRAIN DE REDON CH 12",
  "DRAIN DE KHER LATEX CH 16",
  "SONDE DE PEZZER 18FR",
  "LAME DE DELBE",
  "SONDE DE FOLEY (HOMME) 16 VISICALE URINAIRE",
  "SONDE DE FOLEY (HOMME) 14 VISICALE URINAIRE",
  "SONDE DE FOLEY (HOMME) 18 VISICALE URINAIRE",
  "SONDE DE FOLEY (HOMME) 12 VISICALE URINAIRE",
  "SERINGUE JETABLE 50 CC A GAVAGE BT 30",
  "SERINGUE JETABLE 50 CC LUER-LOCK BT 30",
  "SERINGUE JETABLE 20 CC A VISE LUER-LOK",
  "PERFUSEUR",
  "INTRANULE G20 ROSE",
  "INTRANULE G24 JAUNE",
  "INTRANULE G14 ORANGE",
  "INTRANULE G22 BLEU",
  "INTRANULE G18 VERT",
  "POCHE DE KARAYA S/SUPPORT COLOSTOMIE",
  "POLYVIDONE IODEE 4% FL/125ML",
  "BROSSE CHIRURGICALE BETADINEE",
  "ELASTO 8 CM",
  "ELASTO 20 CM",
  "ELASTO 10 CM",
  "ELASTO 15 CM",
  "BANDE RESINE N°3 7,5 CM",
  "BANDE RESINE N°4 10 CM",
  "BANDE RESINE N°5 12,5 CM",
  "BANDE PLATREE 3M X 15CM",
  "BANDE PLATREE 3M X 20CM",
  "BANDE PLATREE 3M X 10CM",
  "GLYCOCOLLE SOL P/IRRIGATION VESICALE INJ 1,5% PO/3L",
  "BROSSE CHIRURGICALE BETADINEE",
  "GANT CHIRURGICAL STERILE 7 BT 50",
  "GANT CHIRURGICAL STERILE 6,5 BT 50",
  "GANT CHIRURGICAL STERILE 7,5 BT 50",
  "ETIQUETTE TEMOIN",
  "ELASTO 20 CM",
  "ELASTO 15 CM",
  "ELASTO 10 CM",
  "IOHEXOL INJ 300MG/ML FL/100ML",
  "ABAISSE LANGUE A USAGE UNIQUE",
  "COMPRESSE 10*10 CM BT/100",
  "COMPRESSE 7,5*7,5 CM BT/100",
  "CAGOULE BOITE DE 40",
  "CHLORURE DE SODIUM INJ 0,9% FL/500ML",
  "FIL RESORBABLE 2/0 26MM ROND BT 36",
  "FIL RESORBABLE 2/0 36MM ROND BT 36",
  "FIL RESORBABLE 0 36MM ROND BT 36",
  "GELOFUSINE 4% 20G FL/500ML",
  "GLUCOSE INJ.5%FL/500ML SGI",
  "SOLUTION DE RINGER LACTATE INJ 500ML",
  "SODIUM BICARBONATE INJ 1,4% FL/500ML",
  "FORTRANS BT 4 SACHET",
  "DOXALAX GEL RECTAL 10 G",
  "NORADRENALINE TARTRATE INJ 8MG/4ML",
  "LIDOCAINE INJ 2% 10ML",
  "KETOPROFENE INJ 100MG",
  "CEDOCOL-CP 40 MG",
  "ACIDE TRANEXAMIQUE INJ 500MG/5 ML",
  "ACIDE TRANEXAMIQUE INJ 500MG/5 ML",
  "DRAIN DE KHER LATEX CH 16",
  "SONDE RECTALE 20 JAUNE",
  "SONDE RECTALE 28 VERT",
  "SONDE RECTALE 20 JAUNE",
  "SONDE RECTALE 28 VERT",
  "SONDE RECTALE CH26",
  "SONDE ENDOTRACHEALE ADULT 6.5",
  "SONDE ENDOTRACHEALE ADULT 7",
  "SONDE ENDOTRACHEALE ADULT 7.5",
  "SONDE ENDOTRACHEALE ADULT 8",
  "SONDE ENDOTRACHEALE PEDIATRIQUE 2.5",
  "SONDE ENDOTRACHEALE PEDIATRIQUE 3.5",
  "SONDE ENDOTRACHEALE PEDIATRIQUE 2.5",
  "SONDE ENDOTRACHEALE PEDIATRIQUE 4.0",
]
const parseDate = (date) => {
  // Try to parse with multiple formats
  const parsed = moment(date, ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"], true);
  return parsed.isValid() ? parsed.toDate() : null; // Return null if the date is invalid
};

exports.getSelectedMedicaments = async (req, res) => {
  try {
    // Fetch medicaments with the total quantity from stock
    const selectedMedicaments = await Pharmacy.find().populate("medicamentId");

    // For each medicament, calculate the total quantity in stock and expiration status
    const medicamentsWithQuantities = await Promise.all(
      selectedMedicaments.map(async (item) => {
        // Fetch the PreExpirationAlert from the Pharmacy model
        const pharmacy = await Pharmacy.findOne({
          medicamentId: item.medicamentId._id,
        });

        // Get the total quantity in stock for this medicament
        const totalQuantityResult = await InStock.aggregate([
          { $match: { medicamentId: item.medicamentId._id } },
          {
            $group: {
              _id: "$medicamentId",
              totalQuantity: { $sum: "$quantity" },
            },
          },
        ]);

        // Calculate expiration status
        const isExpiringSoon = await InStock.aggregate([
          {
            $match: {
              medicamentId: item.medicamentId._id,
              expiryDate: { $exists: true },
            },
          },
          {
            $project: {
              daysUntilExpiration: {
                $ceil: {
                  $divide: [
                    { $subtract: ["$expiryDate", new Date()] },
                    1000 * 60 * 60 * 24,
                  ],
                },
              },
            },
          },
          {
            $match: {
              daysUntilExpiration: { $lte: pharmacy.PreExpirationAlert },
            },
          },
        ]);

        return {
          ...item.toObject(),
          totalQuantity:
            totalQuantityResult.length > 0
              ? totalQuantityResult[0].totalQuantity
              : 0,
          isExpiringSoon: isExpiringSoon.length > 0, // If any stock item is expiring soon
        };
      })
    );

    // Fetch services for the dropdown or other purposes
    const services = await Storage.aggregate([
      {
        $group: {
          _id: "$service",
          storageCount: { $sum: 1 },
          serviceABV: { $first: "$serviceABV" },
          locationType: { $first: "$locationType" },
          serviceId: { $first: "$_id" },
        },
      },
    ]);

    // Render the page with the updated data
    res.render("Pharmacy/index", {
      selectedMedicaments: medicamentsWithQuantities,
      services,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching selected medicaments");
  }
};
exports.selectMedicament = async (req, res) => {
  const { medicamentId } = req.body;
  const userId = req.user._id;
  console.log(userId);
  try {
    // Check if medicament is already selected
    const existing = await Pharmacy.findOne({ medicamentId: medicamentId });
    if (existing) {
      return res.status(400).send("Medicament already selected.");
    }

    // Add medicament to pharmacy collection
    await Pharmacy.create({ medicamentId: medicamentId, addedBy: userId });
    await Medicament.findByIdAndUpdate(medicamentId, { isSelected: true });
    res.status(200).send("Medicament selected successfully.");
  } catch (err) {
    console.error("Error selecting medicament:", err);
    res.status(500).send("Error selecting medicament.");
  }
};

exports.unselectMedicament = async (req, res) => {
  const { medicamentId } = req.body;

  try {
    // Remove medicament from pharmacy collection
    await Pharmacy.deleteOne({ medicamentId: medicamentId });
    await Medicament.findByIdAndUpdate(medicamentId, { isSelected: false });
    res.status(200).send("Medicament unselected successfully.");
  } catch (err) {
    console.error("Error unselecting medicament:", err);
    res.status(500).send("Error unselecting medicament.");
  }
};
exports.settingsMedicament = async (req, res) => {
  const { medicamentId, minquantity, PreExpirationAlert } = req.body;

  try {
    await Pharmacy.findOneAndUpdate(
      { medicamentId: medicamentId }, // Find the Pharmacy document by medicamentId
      { minquantity: minquantity, PreExpirationAlert: PreExpirationAlert } // Update the minquantity field
    );
    res.redirect("back");
  } catch (err) {
    console.error("Error updating minquantity for medicament:", err);
    res.status(500).send("Error updating minquantity for medicament.");
  }
};
exports.getNewPurchaseRequestPage = async (req, res) => {
  try {
    const Medicaments = await PurchaseRequest.find()
      .populate("medicamentId")
      .exec();

    res.render("Pharmacy/newPurchaseRequest");
  } catch (err) {
    console.error("Error getting new purchase request:", err);
    res.status(500).send("Error updating minquantity for medicament.");
  }
};
exports.getNewPurchaseRequestPage = async (req, res) => {
  try {
    const Medicaments = await Medicament.find();

    res.render("Pharmacy/newPurchaseRequest", Medicaments);
  } catch (err) {
    console.error("Error getting new purchase request:", err);
    res.status(500).send("Error updating minquantity for medicament.");
  }
};

module.exports.importInventory = async (req, res, next) => {
  try {
    // Get the file path dynamically (e.g., from multer)
    const filePath = req.file.path;

    // Read the Excel file
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    // Arrays to track results
    const validEntries = [];
    const skippedEntries = [];
    const errors = [];

    for (const [index, row] of data.entries()) {
      try {
        // Validate row data
        if (
          !row.Designation ||
          !row.Forme ||
          !row.Boite_de ||
          !row.StorageName ||
          !row.CreatedBy
        ) {
          console.error(`Missing required fields at row:`, row);
          skippedEntries.push(row);
          continue;
        }

        // Resolve Medicament ID
        const medicament = await Medicament.findOne({
          designation: row.Designation,
        });

        if (!medicament) {
          console.log("Medicament not found:", row.Designation);
          throw new Error(`Medicament not found: ${row.Designation}`);
        }

        // Resolve Storage ID
        const storage = await Storage.findOne({
          storageName: new RegExp(`^${row.StorageName}$`, "i"),
        });

        if (!storage) {
          throw new Error(`Storage not found: ${row.StorageName}`);
        }

        // Resolve CreatedBy User ID
        const user = await User.findOne({
          username: new RegExp(`^${row.CreatedBy}$`, "i"),
        });

        if (!user) {
          throw new Error(`User not found: ${row.CreatedBy}`);
        }

        // Validate expiryDate with a more robust date format check
        let expiryDate = null;
        if (row.ExpiryDate) {
          expiryDate = new Date(row.ExpiryDate);
          if (isNaN(expiryDate.getTime())) {
            // If the date parsing fails, check if the format might be MM/DD/YYYY
            const [month, day, year] = row.ExpiryDate.split("/");
            expiryDate = new Date(`${year}-${month}-${day}`);
            if (isNaN(expiryDate.getTime())) {
              throw new Error(
                `Invalid ExpiryDate format at row ${index + 1}: ${
                  row.ExpiryDate
                }`
              );
            }
          }
        }

        // Prepare data for insertion
        const inStockEntry = {
          medicamentId: medicament._id,
          storageId: storage._id,
          locationCode: row.ServiceABV || 'N/A',
          batchNumber: row.BatchNumber,
          serialNumber: row.SerialNumber || 'N/A',
          expiryDate: expiryDate,
          quantity: Number(row.Quantity) || 0,
          purchase_price: Number(row.PurchasePrice) || 0,
          tva: row.TVA || 'N/A',
          createdBy: user._id,
          remarks: row.Remarks || 'N/A',
        };

        // Add to valid entries
        validEntries.push(inStockEntry);
      } catch (err) {
        // Track errors and skipped entries
        errors.push({ row: index + 1, error: err.message });
        skippedEntries.push(row);
      }
    }

    // Bulk insert valid entries
    if (validEntries.length > 0) {
      await InStock.insertMany(validEntries);
    }

    // Respond with summary
    res.status(200).json({
      message: "Inventory import completed",
      totalRows: data.length,
      importedRows: validEntries.length,
      skippedRows: skippedEntries.length,
      errors,
    });
  } catch (error) {
    console.error("Error importing inventory:", error);
    res
      .status(500)
      .json({ message: "Failed to import inventory", error: error.message });
  }
};
module.exports.change = async (req, res, next) => {
  try {
   

    for (const designation of medicamentList) {
      const medicament = await Medicament.findOne({ designation });

      if (!medicament) {
        console.log(`Medicament not found: ${designation}`);
        continue;
      }

      const existing = await Pharmacy.findOne({ medicamentId: medicament._id });
      if (existing) {
        console.log(`Medicament already selected: ${designation}`);
        continue;
      }

      await Pharmacy.create({ medicamentId: medicament._id, addedBy: null });
      await Medicament.findByIdAndUpdate(medicament._id, { isSelected: true });

      console.log(`Medicament selected: ${designation}`);
    }

    console.log("All medicaments processed.");
  } catch (err) {
    console.error("Error processing medicaments:", err);
  } 
};