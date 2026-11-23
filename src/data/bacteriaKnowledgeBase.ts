import type {
  FunctionalAnnotation,
  PaperCitation,
  TaxonomyInfo,
} from '../types/microbiome';

interface CatalogEntry {
  matchKeys: string[];
  annotation: FunctionalAnnotation;
}

const CATALOG: CatalogEntry[] = [
  {
    "matchKeys": [
      "akkermansia muciniphila",
      "akkermansia"
    ],
    "annotation": {
      "scfaRoles": [
        "propionato",
        "acetato"
      ],
      "metabolicFunctions": [
        "Degradación controlada de mucina intestinal y renovación de la capa de moco",
        "Producción de propionato y acetato que nutren a los colonocitos",
        "Mejora de la sensibilidad a la insulina y metabolismo lipídico del huésped"
      ],
      "barrierAndImmuneRole": "Refuerza las uniones estrechas epiteliales (ocludina, ZO-1), reduce la endotoxemia metabólica por LPS y promueve respuestas reguladoras (Treg / IL-10).",
      "inflammationTendency": "antiinflamatoria",
      "typicalHfdTrendInLiterature": "Frecuentemente modulada o disminuida en ratones con dieta alta en grasas (HFD).",
      "mechanisticHypothesis": "Hipótesis: Su agotamiento bajo HFD adelgaza la barrera mucosa y facilita la translocación de LPS hacia la circulación portal, amplificando la inflamación adiposa.",
      "isCatalogued": true,
      "references": [
        {
          "pmid": "23671105",
          "title": "Cross-talk between Akkermansia muciniphila and intestinal epithelium controls diet-induced obesity",
          "authors": "Everard A et al.",
          "journal": "Proc Natl Acad Sci U S A",
          "year": "2013",
          "doi": "10.1073/pnas.1219451110",
          "url": "https://pubmed.ncbi.nlm.nih.gov/23671105/"
        },
        {
          "pmid": "31263284",
          "title": "Supplementation with Akkermansia muciniphila in overweight and obese human volunteers: a proof-of-concept exploratory study",
          "authors": "Depommier C et al.",
          "journal": "Nat Med",
          "year": "2019",
          "doi": "10.1038/s41591-019-0495-2",
          "url": "https://pubmed.ncbi.nlm.nih.gov/31263284/"
        },
        {
          "pmid": "35641786",
          "title": "Akkermansia muciniphila: paradigm for next-generation beneficial microorganisms",
          "authors": "Cani PD et al.",
          "journal": "Nat Rev Gastroenterol Hepatol",
          "year": "2022",
          "doi": "10.1038/s41575-022-00631-9",
          "url": "https://pubmed.ncbi.nlm.nih.gov/35641786/"
        }
      ]
    }
  },
  {
    "matchKeys": [
      "faecalibacterium prausnitzii",
      "faecalibacterium"
    ],
    "annotation": {
      "scfaRoles": [
        "butirato"
      ],
      "metabolicFunctions": [
        "Principal productor de butirato mediante fermentación de fibra dietética",
        "Suministro energético directo para el epitelio colónico"
      ],
      "barrierAndImmuneRole": "Inhibe la vía proinflamatoria NF-κB e induce la secreción de IL-10 en células dendríticas y macrófagos de la lámina propia.",
      "inflammationTendency": "antiinflamatoria",
      "typicalHfdTrendInLiterature": "Suele disminuir en modelos de obesidad inducida por dieta alta en grasas.",
      "mechanisticHypothesis": "Hipótesis: La menor disponibilidad de fibra fermentable en la dieta HFD reduce su nicho ecológico y priva al colon de butirato antiinflamatorio.",
      "isCatalogued": true,
      "references": [
        {
          "pmid": "18936492",
          "title": "Faecalibacterium prausnitzii is an anti-inflammatory commensal bacterium identified by gut microbiota analysis of Crohn disease patients",
          "authors": "Sokol H et al.",
          "journal": "Proc Natl Acad Sci U S A",
          "year": "2008",
          "doi": "10.1073/pnas.0804812105",
          "url": "https://pubmed.ncbi.nlm.nih.gov/18936492/"
        },
        {
          "pmid": "36164984",
          "title": "Faecalibacterium prausnitzii Attenuates CKD via Butyrate-Renal GPR43 Axis",
          "authors": "Li HB et al.",
          "journal": "Circ Res",
          "year": "2022",
          "doi": "10.1161/CIRCRESAHA.122.320184",
          "url": "https://pubmed.ncbi.nlm.nih.gov/36164984/"
        }
      ]
    }
  },
  {
    "matchKeys": [
      "roseburia intestinalis",
      "roseburia"
    ],
    "annotation": {
      "scfaRoles": [
        "butirato"
      ],
      "metabolicFunctions": [
        "Fermentación de polisacáridos complejos hacia butirato",
        "Regulación del pH luminal y supresión competitiva de patobiontes"
      ],
      "barrierAndImmuneRole": "Estimula la diferenciación de células T reguladoras (Treg) colónicas y fortalece la expresión de proteínas de barrera mucosa.",
      "inflammationTendency": "antiinflamatoria",
      "typicalHfdTrendInLiterature": "Generalmente disminuida en cohortes HFD respecto a dieta control.",
      "mechanisticHypothesis": "Hipótesis: Su descenso contribuye a una menor señalización HDAC-dependiente mediada por butirato y mayor susceptibilidad a inflamación de bajo grado.",
      "isCatalogued": true,
      "references": [
        {
          "pmid": "39976263",
          "title": "Roseburia hominis improves host metabolism in diet-induced obesity",
          "authors": "Huang W et al.",
          "journal": "Gut Microbes",
          "year": "2025",
          "doi": "10.1080/19490976.2025.2467193",
          "url": "https://pubmed.ncbi.nlm.nih.gov/39976263/"
        },
        {
          "pmid": "37491158",
          "title": "Roseburia intestinalis generated butyrate boosts anti-PD-1 efficacy in colorectal cancer by activating cytotoxic CD8(+) T cells",
          "authors": "Kang X et al.",
          "journal": "Gut",
          "year": "2023",
          "doi": "10.1136/gutjnl-2023-330291",
          "url": "https://pubmed.ncbi.nlm.nih.gov/37491158/"
        }
      ]
    }
  },
  {
    "matchKeys": [
      "bifidobacterium pseudolongum",
      "bifidobacterium"
    ],
    "annotation": {
      "scfaRoles": [
        "acetato"
      ],
      "metabolicFunctions": [
        "Producción de acetato y lactato mediante la vía de la fosfocetolasa",
        "Alimentación cruzada (cross-feeding) hacia bacterias productoras de butirato"
      ],
      "barrierAndImmuneRole": "Asociada a menor permeabilidad intestinal, disminución de lipopolisacáridos circulantes y modulación favorable de citocinas proinflamatorias.",
      "inflammationTendency": "antiinflamatoria",
      "typicalHfdTrendInLiterature": "Comúnmente reducida en ratones alimentados con HFD.",
      "mechanisticHypothesis": "Hipótesis: La pérdida de Bifidobacterium en HFD reduce el acetato luminal y debilita la protección frente a endotoxemia metabólica.",
      "isCatalogued": true,
      "references": [
        {
          "pmid": "37459922",
          "title": "Bifidobacterium pseudolongum-generated acetate suppresses non-alcoholic fatty liver disease-associated hepatocellular carcinoma",
          "authors": "Song Q et al.",
          "journal": "J Hepatol",
          "year": "2023",
          "doi": "10.1016/j.jhep.2023.07.005",
          "url": "https://pubmed.ncbi.nlm.nih.gov/37459922/"
        },
        {
          "pmid": "39742294",
          "title": "Gut Bifidobacterium pseudocatenulatum protects against fat deposition by enhancing secondary bile acid biosynthesis",
          "authors": "Zha A et al.",
          "journal": "Imeta",
          "year": "2024",
          "doi": "10.1002/imt2.261",
          "url": "https://pubmed.ncbi.nlm.nih.gov/39742294/"
        }
      ]
    }
  },
  {
    "matchKeys": [
      "lactobacillus johnsonii",
      "lactobacillus",
      "ligilactobacillus",
      "limosilactobacillus"
    ],
    "annotation": {
      "scfaRoles": [
        "acetato"
      ],
      "metabolicFunctions": [
        "Fermentación láctica y modulación de sales biliares (hidrolasas de sales biliares - BSH)",
        "Regulación de la absorción intestinal de lípidos y pH ácido luminal"
      ],
      "barrierAndImmuneRole": "Interactúa con receptores de reconocimiento epitelial favoreciendo péptidos antimicrobianos y preservación de uniones estrechas.",
      "inflammationTendency": "antiinflamatoria",
      "typicalHfdTrendInLiterature": "Variable según especie/cepa y formulación de la dieta HFD.",
      "mechanisticHypothesis": "Hipótesis: Cambios en Lactobacillus/Ligilactobacillus pueden alterar la desconjugación de ácidos biliares y la señalización FXR/TGR5 en hígado e intestino.",
      "isCatalogued": true,
      "references": [
        {
          "pmid": "40953220",
          "title": "Lactobacillus johnsonii Synthesizes Chenodeoxycholic Acid to Reduce Susceptibility to High-Fat Diet-Induced Colorectal Cancer",
          "authors": "Liu C et al.",
          "journal": "Cancer Res",
          "year": "2025",
          "doi": "10.1158/0008-5472.CAN-25-0879",
          "url": "https://pubmed.ncbi.nlm.nih.gov/40953220/"
        },
        {
          "pmid": "39837844",
          "title": "Lactobacillus reuteri ZJ617 attenuates metabolic syndrome via microbiota-derived spermidine",
          "authors": "Ma Y et al.",
          "journal": "Nat Commun",
          "year": "2025",
          "doi": "10.1038/s41467-025-56105-4",
          "url": "https://pubmed.ncbi.nlm.nih.gov/39837844/"
        }
      ]
    }
  },
  {
    "matchKeys": [
      "muribaculaceae",
      "muribaculum",
      "s24-7",
      "paramuribaculum"
    ],
    "annotation": {
      "scfaRoles": [
        "propionato",
        "acetato"
      ],
      "metabolicFunctions": [
        "Degradación de carbohidratos complejos del huésped y fibra dietética en el intestino murino",
        "Producción relevante de propionato y acetato en ratones sanos"
      ],
      "barrierAndImmuneRole": "Familia dominante en ratones con dieta estándar; asociada a homeostasis epitelial y menor inflamación metabólica.",
      "inflammationTendency": "antiinflamatoria",
      "typicalHfdTrendInLiterature": "Marcadamente disminuida en ratones C57BL/6J bajo HFD.",
      "mechanisticHypothesis": "Hipótesis: Su colapso bajo HFD explica gran parte de la caída en la abundancia relativa de Bacteroidota y en el ratio F/B alterado.",
      "isCatalogued": true,
      "references": [
        {
          "pmid": "39203797",
          "title": "Exploration of the Muribaculaceae Family in the Gut Microbiota: Diversity, Metabolism, and Function",
          "authors": "Zhu Y et al.",
          "journal": "Nutrients",
          "year": "2024",
          "doi": "10.3390/nu16162660",
          "url": "https://pubmed.ncbi.nlm.nih.gov/39203797/"
        },
        {
          "pmid": "40249311",
          "title": "Muribaculum intestinale restricts Salmonella Typhimurium colonization by converting succinate to propionate",
          "authors": "Wang Z et al.",
          "journal": "ISME J",
          "year": "2025",
          "doi": "10.1093/ismejo/wraf069",
          "url": "https://pubmed.ncbi.nlm.nih.gov/40249311/"
        }
      ]
    }
  },
  {
    "matchKeys": [
      "alistipes"
    ],
    "annotation": {
      "scfaRoles": [
        "acetato",
        "propionato"
      ],
      "metabolicFunctions": [
        "Fermentación de aminoácidos y carbohidratos hacia acetato, succinato y propionato",
        "Modulación del metabolismo lipídico y señalización de ácidos biliares"
      ],
      "barrierAndImmuneRole": "Rol dependiente del contexto y especie: ciertas especies protegen frente a colitis mediante AGCC, mientras otras correlacionan con inflamación o resistencia metabólica.",
      "inflammationTendency": "dependiente_contexto",
      "typicalHfdTrendInLiterature": "Suele reducirse drásticamente en dietas altas en grasa con baja fibra (p. ej. D12492).",
      "mechanisticHypothesis": "Hipótesis: La depleción de fibra soluble en HFD restringe el nicho saccarolítico de Alistipes, reduciendo su producción de AGCC protectores.",
      "isCatalogued": true,
      "references": [
        {
          "pmid": "32582143",
          "title": "The Genus Alistipes: Gut Bacteria With Emerging Implications to Inflammation, Cancer, and Mental Health",
          "authors": "Parker BJ et al.",
          "journal": "Front Immunol",
          "year": "2020",
          "doi": "10.3389/fimmu.2020.00906",
          "url": "https://pubmed.ncbi.nlm.nih.gov/32582143/"
        }
      ]
    }
  },
  {
    "matchKeys": [
      "blautia"
    ],
    "annotation": {
      "scfaRoles": [
        "acetato"
      ],
      "metabolicFunctions": [
        "Acetogénesis anaerobia y síntesis de metabolitos beneficiosos (ornitina/acetilcolina/S-adenosilmetionina)",
        "Participación en redes de alimentación cruzada dentro de Lachnospiraceae"
      ],
      "barrierAndImmuneRole": "Asociada a efectos antiinflamatorios y mejora de la homeostasis de glucosa y lípidos en modelos murinos de obesidad.",
      "inflammationTendency": "antiinflamatoria",
      "typicalHfdTrendInLiterature": "Frecuentemente asociada de forma inversa a adiposidad visceral en múltiples cohortes.",
      "mechanisticHypothesis": "Hipótesis: El mantenimiento de acetato y metabolitos derivados de Blautia contribuye al control inmunometabólico en tejido adiposo.",
      "isCatalogued": true,
      "references": [
        {
          "pmid": "35982037",
          "title": "Oral administration of Blautia wexlerae ameliorates obesity and type 2 diabetes via metabolic remodeling of the gut microbiota",
          "authors": "Hosomi K et al.",
          "journal": "Nat Commun",
          "year": "2022",
          "doi": "10.1038/s41467-022-32015-7",
          "url": "https://pubmed.ncbi.nlm.nih.gov/35982037/"
        }
      ]
    }
  },
  {
    "matchKeys": [
      "mucispirillum"
    ],
    "annotation": {
      "scfaRoles": [],
      "metabolicFunctions": [
        "Habitante especializado de la capa externa de moco colónico; metabolismo anaerobio de nitrato/glicanos"
      ],
      "barrierAndImmuneRole": "Estrechamente ligado al nicho epitelial mucoso; puede expandirse en inflamación mucosa o remodelación dietética de la barrera.",
      "inflammationTendency": "dependiente_contexto",
      "typicalHfdTrendInLiterature": "Su abundancia relativa varía según el grado de alteración de la capa de mucina.",
      "mechanisticHypothesis": "Hipótesis: Cambios en la disponibilidad de mucina y especies reactivas bajo HFD modulan la colonización de Mucispirillum.",
      "isCatalogued": true,
      "references": [
        {
          "pmid": "31006637",
          "title": "Mucispirillum schaedleri Antagonizes Salmonella Virulence to Protect Mice against Colitis",
          "authors": "Herp S et al.",
          "journal": "Cell Host Microbe",
          "year": "2019",
          "doi": "10.1016/j.chom.2019.03.004",
          "url": "https://pubmed.ncbi.nlm.nih.gov/31006637/"
        },
        {
          "pmid": "40236479",
          "title": "Nutraceutical supplement slim reshaped colon histomorphology and reduces Mucispirillum schaedleri in obese mice",
          "authors": "Freitas JA et al.",
          "journal": "Front Microbiol",
          "year": "2025",
          "doi": "10.3389/fmicb.2025.1494994",
          "url": "https://pubmed.ncbi.nlm.nih.gov/40236479/"
        }
      ]
    }
  },
  {
    "matchKeys": [
      "bilophila wadsworthia",
      "bilophila"
    ],
    "annotation": {
      "scfaRoles": [],
      "metabolicFunctions": [
        "Reducción de sulfito/taurina proveniente de ácidos biliares conjugados con taurina (taurocólico)",
        "Generación de sulfuro de hidrógeno (H₂S) en el lumen colónico"
      ],
      "barrierAndImmuneRole": "El exceso de H₂S puede dañar la capa mucosa, activar vías proinflamatorias (IFN-γ, IL-6, TNF-α) y exacerbar la disfunción de barrera.",
      "inflammationTendency": "proinflamatoria",
      "typicalHfdTrendInLiterature": "Frecuentemente aumentada o detectada selectivamente en dietas altas en grasas saturadas.",
      "mechanisticHypothesis": "Hipótesis: Las grasas saturadas estimulan la secreción biliar rica en taurina, creando un nicho selectivo para Bilophila y promoviendo inflamación colónica.",
      "isCatalogued": true,
      "references": [
        {
          "pmid": "22722865",
          "title": "Dietary-fat-induced taurocholic acid promotes pathobiont expansion and colitis in Il10-/- mice",
          "authors": "Devkota S et al.",
          "journal": "Nature",
          "year": "2012",
          "doi": "10.1038/nature11225",
          "url": "https://pubmed.ncbi.nlm.nih.gov/22722865/"
        },
        {
          "pmid": "40447622",
          "title": "Bacterial microcompartments and energy metabolism drive gut colonization by Bilophila wadsworthia",
          "authors": "Sayavedra L et al.",
          "journal": "Nat Commun",
          "year": "2025",
          "doi": "10.1038/s41467-025-60180-y",
          "url": "https://pubmed.ncbi.nlm.nih.gov/40447622/"
        }
      ]
    }
  },
  {
    "matchKeys": [
      "desulfovibrio"
    ],
    "annotation": {
      "scfaRoles": [],
      "metabolicFunctions": [
        "Bacterias reductoras de sulfato productoras de sulfuro de hidrógeno (H₂S)",
        "Contribución de lipopolisacárido (LPS) de membrana externa Gram-negativa"
      ],
      "barrierAndImmuneRole": "Asociada a erosión del moco protector, activación de TLR4/NF-κB y aumento de citocinas proinflamatorias en modelos metabólicos.",
      "inflammationTendency": "proinflamatoria",
      "typicalHfdTrendInLiterature": "Tiende a aumentar en ratones alimentados con HFD.",
      "mechanisticHypothesis": "Hipótesis: La acumulación de H₂S inhibe la oxidación de butirato en los colonocitos, debilitando la barrera epitelial.",
      "isCatalogued": true,
      "references": [
        {
          "pmid": "37512944",
          "title": "Desulfovibrio in the Gut: The Enemy within?",
          "authors": "Singh SB et al.",
          "journal": "Microorganisms",
          "year": "2023",
          "doi": "10.3390/microorganisms11071772",
          "url": "https://pubmed.ncbi.nlm.nih.gov/37512944/"
        }
      ]
    }
  },
  {
    "matchKeys": [
      "ruminococcus gnavus",
      "mediterraneibacter gnavus",
      "ruminococcus_gnavus"
    ],
    "annotation": {
      "scfaRoles": [
        "acetato",
        "propionato"
      ],
      "metabolicFunctions": [
        "Utilización de glicanos de mucina del huésped",
        "Síntesis de polisacáridos complejos de superficie"
      ],
      "barrierAndImmuneRole": "Produce un glucorhamnano proinflamatorio capaz de estimular la secreción de TNF-α vía TLR4 en células inmunes.",
      "inflammationTendency": "proinflamatoria",
      "typicalHfdTrendInLiterature": "Asociada positivamente con inflamación intestinal y obesidad metabólica.",
      "mechanisticHypothesis": "Hipótesis: Su expansión en ausencia de otros degradadores de mucina benéficos podría incrementar la exposición inmune a antígenos luminales.",
      "isCatalogued": true,
      "references": [
        {
          "pmid": "31182571",
          "title": "Ruminococcus gnavus, a member of the human gut microbiome associated with Crohn's disease, produces an inflammatory polysaccharide",
          "authors": "Henke MT et al.",
          "journal": "Proc Natl Acad Sci U S A",
          "year": "2019",
          "doi": "10.1073/pnas.1904099116",
          "url": "https://pubmed.ncbi.nlm.nih.gov/31182571/"
        },
        {
          "pmid": "29183332",
          "title": "A novel Ruminococcus gnavus clade enriched in inflammatory bowel disease patients",
          "authors": "Hall AB et al.",
          "journal": "Genome Med",
          "year": "2017",
          "doi": "10.1186/s13073-017-0490-5",
          "url": "https://pubmed.ncbi.nlm.nih.gov/29183332/"
        }
      ]
    }
  },
  {
    "matchKeys": [
      "oscillibacter",
      "oscillospira",
      "oscillospiraceae"
    ],
    "annotation": {
      "scfaRoles": [],
      "metabolicFunctions": [
        "Metabolismo de ácidos grasos y derivados esteroides/colesterol en el lumen",
        "Fermentación anaerobia de aminoácidos y carbohidratos residuales"
      ],
      "barrierAndImmuneRole": "Su asociación con la barrera intestinal depende de la dieta; en varios estudios murinos con HFD su variación correlaciona con cambios en uniones estrechas e inflamación adiposa.",
      "inflammationTendency": "dependiente_contexto",
      "typicalHfdTrendInLiterature": "Frecuentemente alterada en ratones bajo dieta alta en grasas.",
      "mechanisticHypothesis": "Hipótesis: Podría responder a la mayor carga lipídica luminal y participar en rutas metabólicas asociadas a resistencia a la insulina.",
      "isCatalogued": true,
      "references": [
        {
          "pmid": "37735685",
          "title": "Reducing gut microbiome-driven adipose tissue inflammation alleviates metabolic syndrome",
          "authors": "Newman NK et al.",
          "journal": "Microbiome",
          "year": "2023",
          "doi": "10.1186/s40168-023-01637-4",
          "url": "https://pubmed.ncbi.nlm.nih.gov/37735685/"
        },
        {
          "pmid": "41316428",
          "title": "Lysine restriction attenuates obesity-related anxiety-like behaviors via increasing Oscillibacter ruminantium-mediated tryptophol regulation",
          "authors": "Zhao F et al.",
          "journal": "Microbiome",
          "year": "2025",
          "doi": "10.1186/s40168-025-02217-4",
          "url": "https://pubmed.ncbi.nlm.nih.gov/41316428/"
        }
      ]
    }
  },
  {
    "matchKeys": [
      "allobaculum"
    ],
    "annotation": {
      "scfaRoles": [
        "acetato"
      ],
      "metabolicFunctions": [
        "Fermentación rápida de carbohidratos simples y producción de ácidos grasos de cadena corta",
        "Interacción con la regulación energética y señalización ANGPTL4 epitelial"
      ],
      "barrierAndImmuneRole": "Efectos dependientes de cepa y contexto dietético: algunas cepas se asocian a homeostasis metabólica y otras proliferan en dietas occidentales ricas en sacarosa/grasa.",
      "inflammationTendency": "dependiente_contexto",
      "typicalHfdTrendInLiterature": "Comportamiento variable; suele alterarse significativamente entre Control y HFD.",
      "mechanisticHypothesis": "Hipótesis: Las variaciones responden a la composición exacta de carbohidratos simples frente a grasas en la dieta experimental.",
      "isCatalogued": true,
      "references": [
        {
          "pmid": "34095196",
          "title": "Allobaculum Involves in the Modulation of Intestinal ANGPTLT4 Expression in Mice Treated by High-Fat Diet",
          "authors": "Zheng Z et al.",
          "journal": "Front Nutr",
          "year": "2021",
          "doi": "10.3389/fnut.2021.690138",
          "url": "https://pubmed.ncbi.nlm.nih.gov/34095196/"
        },
        {
          "pmid": "38402930",
          "title": "Semaglutide alleviates gut microbiota dysbiosis induced by a high-fat diet",
          "authors": "Duan X et al.",
          "journal": "Eur J Pharmacol",
          "year": "2024",
          "doi": "10.1016/j.ejphar.2024.176440",
          "url": "https://pubmed.ncbi.nlm.nih.gov/38402930/"
        }
      ]
    }
  },
  {
    "matchKeys": [
      "lachnospiraceae nk4a136",
      "lachnospiraceae_nk4a136",
      "lachnospiraceae"
    ],
    "annotation": {
      "scfaRoles": [
        "butirato"
      ],
      "metabolicFunctions": [
        "Productores importantes de butirato a partir de fibra vegetal",
        "Mantenimiento del metabolismo oxidativo de los colonocitos"
      ],
      "barrierAndImmuneRole": "Correlaciona inversamente con permeabilidad intestinal y marcadores inflamatorios séricos en múltiples estudios en ratones.",
      "inflammationTendency": "antiinflamatoria",
      "typicalHfdTrendInLiterature": "Suele disminuir bajo dieta HFD, aunque algunos géneros dentro de la familia pueden aumentar.",
      "mechanisticHypothesis": "Hipótesis: La pérdida del grupo NK4A136 reduce el tono butiratogénico colónico y favorece un estado proinflamatorio.",
      "isCatalogued": true,
      "references": [
        {
          "pmid": "36721179",
          "title": "Gut microbiota-derived metabolites mediate the neuroprotective effect of melatonin in cognitive impairment induced by sleep deprivation",
          "authors": "Wang X et al.",
          "journal": "Microbiome",
          "year": "2023",
          "doi": "10.1186/s40168-022-01452-3",
          "url": "https://pubmed.ncbi.nlm.nih.gov/36721179/"
        },
        {
          "pmid": "38901285",
          "title": "Gualou-Xiebai-Banxia-Tang regulates liver-gut axis to ameliorate Metabolic Syndrome in HFD-fed mice",
          "authors": "Zhang Y et al.",
          "journal": "Phytomedicine",
          "year": "2024",
          "doi": "10.1016/j.phymed.2023.155320",
          "url": "https://pubmed.ncbi.nlm.nih.gov/38901285/"
        }
      ]
    }
  },
  {
    "matchKeys": [
      "bacteroides acidifaciens",
      "bacteroides"
    ],
    "annotation": {
      "scfaRoles": [
        "acetato",
        "propionato"
      ],
      "metabolicFunctions": [
        "Fermentación de polisacáridos y metabolismo de ácidos biliares",
        "Producción de acetato y propionato; regulación de enzimas lipogénicas"
      ],
      "barrierAndImmuneRole": "En ratones, B. acidifaciens se ha vinculado con activación de IgA secretora intestinal y protección frente a obesidad, aunque especies relacionadas de Bacteroides responden de forma variable según el contenido de fibra.",
      "inflammationTendency": "dependiente_contexto",
      "typicalHfdTrendInLiterature": "Depende de la especie exacta y de la formulación de fibra/grasa de la dieta.",
      "mechanisticHypothesis": "Hipótesis: Modula la oxidación lipídica hepática y la señalización de GLP-1 mediante metabolitos derivados de la fermentación.",
      "isCatalogued": true,
      "references": [
        {
          "pmid": "27118489",
          "title": "Gut commensal Bacteroides acidifaciens prevents obesity and improves insulin sensitivity in mice",
          "authors": "Yang JY et al.",
          "journal": "Mucosal Immunol",
          "year": "2017",
          "doi": "10.1038/mi.2016.42",
          "url": "https://pubmed.ncbi.nlm.nih.gov/27118489/"
        },
        {
          "pmid": "35787106",
          "title": "The interplay between PCOS pathology and diet on gut microbiota in a mouse model",
          "authors": "Rodriguez Paris V et al.",
          "journal": "Gut Microbes",
          "year": "2022",
          "doi": "10.1080/19490976.2022.2085961",
          "url": "https://pubmed.ncbi.nlm.nih.gov/35787106/"
        }
      ]
    }
  },
  {
    "matchKeys": [
      "parabacteroides distasonis",
      "parabacteroides"
    ],
    "annotation": {
      "scfaRoles": [
        "acetato"
      ],
      "metabolicFunctions": [
        "Transformación de ácidos biliares primarios en secundarios (ácido litocólico/ursodesoxicólico)",
        "Producción de succinato y acetato con impacto en gluconeogénesis intestinal"
      ],
      "barrierAndImmuneRole": "Documentado como modulador de la señalización FXR y de la integridad de la barrera epitelial en modelos murinos de obesidad.",
      "inflammationTendency": "antiinflamatoria",
      "typicalHfdTrendInLiterature": "Frecuentemente alterada en ratones con HFD.",
      "mechanisticHypothesis": "Hipótesis: La producción de succinato y ácidos biliares secundarios activa receptores FXR/TGR5 reduciendo la acumulación lipídica hepática.",
      "isCatalogued": true,
      "references": [
        {
          "pmid": "30605678",
          "title": "Parabacteroides distasonis Alleviates Obesity and Metabolic Dysfunctions via Production of Succinate and Secondary Bile Acids",
          "authors": "Wang K et al.",
          "journal": "Cell Rep",
          "year": "2019",
          "doi": "10.1016/j.celrep.2018.12.028",
          "url": "https://pubmed.ncbi.nlm.nih.gov/30605678/"
        },
        {
          "pmid": "36604114",
          "title": "Gut commensal Parabacteroides distasonis alleviates inflammatory arthritis",
          "authors": "Sun H et al.",
          "journal": "Gut",
          "year": "2023",
          "doi": "10.1136/gutjnl-2022-327756",
          "url": "https://pubmed.ncbi.nlm.nih.gov/36604114/"
        }
      ]
    }
  },
  {
    "matchKeys": [
      "turicibacter"
    ],
    "annotation": {
      "scfaRoles": [
        "butirato"
      ],
      "metabolicFunctions": [
        "Interacción directa con el metabolismo lipídico del huésped y niveles de serotonina intestinal",
        "Modulación diferencial del perfil de triglicéridos séricos y ácidos biliares"
      ],
      "barrierAndImmuneRole": "Su abundancia se ve alterada en respuestas inflamatorias y dietas ricas en grasa saturada.",
      "inflammationTendency": "dependiente_contexto",
      "typicalHfdTrendInLiterature": "Frecuentemente alterada en HFD según fuente lipídica y cepa murina.",
      "mechanisticHypothesis": "Hipótesis: Cambios en Turicibacter modifican la transformación de ácidos biliares dependiente de cepa e influyen en el almacenamiento lipídico.",
      "isCatalogued": true,
      "references": [
        {
          "pmid": "37339963",
          "title": "Gut microbiota Turicibacter strains differentially modify bile acids and host lipids",
          "authors": "Lynch JB et al.",
          "journal": "Nat Commun",
          "year": "2023",
          "doi": "10.1038/s41467-023-39403-7",
          "url": "https://pubmed.ncbi.nlm.nih.gov/37339963/"
        },
        {
          "pmid": "41197631",
          "title": "Dietary fat disrupts a commensal-host lipid network that promotes metabolic health",
          "authors": "Klag K et al.",
          "journal": "Cell Metab",
          "year": "2026",
          "doi": "10.1016/j.cmet.2025.10.007",
          "url": "https://pubmed.ncbi.nlm.nih.gov/41197631/"
        }
      ]
    }
  },
  {
    "matchKeys": [
      "clostridium sensu stricto",
      "clostridium_sensu_stricto",
      "clostridium"
    ],
    "annotation": {
      "scfaRoles": [
        "acetato"
      ],
      "metabolicFunctions": [
        "Fermentación de aminoácidos y carbohidratos residuales",
        "Participación en 7α-deshidroxilación de ácidos biliares según especie"
      ],
      "barrierAndImmuneRole": "Efecto dependiente de especie: clústeres comensales inducen Treg, mientras ciertas especies oportunistas se expanden en disbiosis.",
      "inflammationTendency": "dependiente_contexto",
      "typicalHfdTrendInLiterature": "Suele modificarse en dietas hipercalóricas con alto contenido lipídico-proteico.",
      "mechanisticHypothesis": "Hipótesis: Un incremento bajo HFD puede reflejar mayor flujo de residuos proteicos y biliares hacia el colon distal.",
      "isCatalogued": true,
      "references": [
        {
          "pmid": "31734354",
          "title": "Clostridium butyricum, a butyrate-producing probiotic, inhibits intestinal tumor development through modulating Wnt signaling and gut microbiota",
          "authors": "Chen D et al.",
          "journal": "Cancer Lett",
          "year": "2020",
          "doi": "10.1016/j.canlet.2019.11.019",
          "url": "https://pubmed.ncbi.nlm.nih.gov/31734354/"
        },
        {
          "pmid": "40190016",
          "title": "Cross-feeding-based rational design of a probiotic combination of Bacterides xylanisolvens and Clostridium butyricum therapy for metabolic diseases",
          "authors": "Qiao S et al.",
          "journal": "Gut Microbes",
          "year": "2025",
          "doi": "10.1080/19490976.2025.2489765",
          "url": "https://pubmed.ncbi.nlm.nih.gov/40190016/"
        }
      ]
    }
  },
  {
    "matchKeys": [
      "escherichia",
      "shigella",
      "enterobacteriaceae"
    ],
    "annotation": {
      "scfaRoles": [],
      "metabolicFunctions": [
        "Metabolismo anaerobio facultativo adaptado a nichos con mayor oxígeno/nitrato luminal en inflamación",
        "Síntesis de lipopolisacárido (LPS) de alta potencia endotóxica (lípido A hexa-acilado)"
      ],
      "barrierAndImmuneRole": "Potente activador de TLR4 en macrófagos y epitelio intestinal; promueve IL-1β, IL-6, TNF-α y reclutamiento neutrofílico.",
      "inflammationTendency": "proinflamatoria",
      "typicalHfdTrendInLiterature": "Suele expandirse en escenarios de inflamación intestinal asociada a HFD.",
      "mechanisticHypothesis": "Hipótesis: La inflamación mucosa genera especies reactivas de nitrógeno/oxígeno que favorecen a Enterobacteriaceae sobre anaerobios estrictos.",
      "isCatalogued": true,
      "references": [
        {
          "pmid": "36809030",
          "title": "The Gut Commensal Escherichia coli Aggravates High-Fat-Diet-Induced Obesity and Insulin Resistance in Mice",
          "authors": "Ju T et al.",
          "journal": "Appl Environ Microbiol",
          "year": "2023",
          "doi": "10.1128/aem.01628-22",
          "url": "https://pubmed.ncbi.nlm.nih.gov/36809030/"
        },
        {
          "pmid": "39653685",
          "title": "Dietary inulin ameliorates obesity-induced severe acute pancreatitis via gut-pancreas axis",
          "authors": "Li X et al.",
          "journal": "Gut Microbes",
          "year": "2024",
          "doi": "10.1080/19490976.2024.2436949",
          "url": "https://pubmed.ncbi.nlm.nih.gov/39653685/"
        }
      ]
    }
  },
  {
    "matchKeys": [
      "prevotella copri",
      "prevotella",
      "prevotellaceae"
    ],
    "annotation": {
      "scfaRoles": [
        "propionato",
        "acetato"
      ],
      "metabolicFunctions": [
        "Fermentación de polisacáridos vegetales y xilano",
        "Síntesis de aminoácidos de cadena ramificada (BCAA) en ciertos contextos dietéticos"
      ],
      "barrierAndImmuneRole": "Rol dual dependiente de la dieta: benéfico en dietas ricas en fibra, pero vinculado a resistencia a la insulina e inflamación Th17 en exceso con dietas grasas.",
      "inflammationTendency": "dependiente_contexto",
      "typicalHfdTrendInLiterature": "Variable según dieta basal y proveedor de los ratones.",
      "mechanisticHypothesis": "Hipótesis: Bajo dieta rica en grasas, la producción microbiana de BCAA podría contribuir a la resistencia a la insulina.",
      "isCatalogued": true,
      "references": [
        {
          "pmid": "27409811",
          "title": "Human gut microbes impact host serum metabolome and insulin sensitivity",
          "authors": "Pedersen HK et al.",
          "journal": "Nature",
          "year": "2016",
          "doi": "10.1038/nature18646",
          "url": "https://pubmed.ncbi.nlm.nih.gov/27409811/"
        },
        {
          "pmid": "37591518",
          "title": "Prevotella copri alleviates sarcopenia via attenuating muscle mass loss and function decline",
          "authors": "Liu X et al.",
          "journal": "J Cachexia Sarcopenia Muscle",
          "year": "2023",
          "doi": "10.1002/jcsm.13313",
          "url": "https://pubmed.ncbi.nlm.nih.gov/37591518/"
        }
      ]
    }
  }
];

export function getFunctionalAnnotation(taxonomy: TaxonomyInfo): FunctionalAnnotation {
  const candidates = [
    taxonomy.species,
    taxonomy.genus,
    taxonomy.family,
    taxonomy.rawName,
  ]
    .map((s) => s.toLowerCase().trim())
    .filter(Boolean);

  for (const entry of CATALOG) {
    for (const key of entry.matchKeys) {
      if (candidates.some((c) => c.includes(key))) {
        return entry.annotation;
      }
    }
  }

  return {
    scfaRoles: [],
    metabolicFunctions: [
      'Taxón no presente en el catálogo funcional local pre-curado.',
    ],
    barrierAndImmuneRole:
      'Sin perfil funcional local asignado automáticamente. Utilice la consulta en PubMed y BugSigDB para revisar evidencia científica publicada sobre este taxón.',
    inflammationTendency: 'no_caracterizada',
    typicalHfdTrendInLiterature: 'Sin referencia local pre-curada; verifique artículos en PubMed o firmas en BugSigDB.',
    mechanisticHypothesis:
      'Hipótesis pendiente de respaldo bibliográfico específico para el nivel taxonómico detectado.',
    references: [],
    isCatalogued: false,
  };
}

export interface MetabolicPathwaySummary {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  hfdImpactSummary: string;
  hypothesisNote: string;
  references: PaperCitation[];
}

export const METABOLIC_PATHWAYS: MetabolicPathwaySummary[] = [
  {
    "id": "scfa_butirato",
    "name": "Producción de Butirato",
    "subtitle": "Ácido graso de cadena corta (AGCC) clave del colonocito",
    "description": "Principal fuente energética del epitelio colónico (~70% del ATP), inhibidor natural de histonas deacetilasas (HDAC) y promotor de la barrera mucosa y células Treg.",
    "hfdImpactSummary": "Las dietas altas en grasas y bajas en fibra fermentable suelen reducir taxones butiratogénicos (Lachnospiraceae, Roseburia, Faecalibacterium).",
    "hypothesisNote": "Hipótesis: Menor disponibilidad de butirato reduce la fosforilación oxidativa epitelial, eleva el oxígeno luminal y favorece la expansión de patobiontes facultativos.",
    "references": [
      {
        "pmid": "24226770",
        "title": "Commensal microbe-derived butyrate induces the differentiation of colonic regulatory T cells",
        "authors": "Furusawa Y et al.",
        "journal": "Nature",
        "year": "2013",
        "doi": "10.1038/nature12721",
        "url": "https://pubmed.ncbi.nlm.nih.gov/24226770/"
      },
      {
        "pmid": "28104981",
        "title": "Sodium butyrate attenuates high-fat diet-induced steatohepatitis in mice by improving gut microbiota and gastrointestinal barrier",
        "authors": "Zhou D et al.",
        "journal": "World J Gastroenterol",
        "year": "2017",
        "doi": "10.3748/wjg.v23.i1.60",
        "url": "https://pubmed.ncbi.nlm.nih.gov/28104981/"
      }
    ]
  },
  {
    "id": "scfa_propionato_acetato",
    "name": "Propionato y Acetato",
    "subtitle": "Señalización energética, saciedad (GLP-1/PYY) y eje intestino-hígado",
    "description": "El propionato regula la gluconeogénesis y la señalización de receptores FFAR2/FFAR3 (GPR41/GPR43), mientras el acetato participa en la homeostasis lipídica y alimentación cruzada bacteriana.",
    "hfdImpactSummary": "Cambios en Muribaculaceae, Akkermansia, Alistipes y Bacteroides modifican el balance propionato/acetato bajo exposición prolongada a HFD.",
    "hypothesisNote": "Hipótesis: El desequilibrio de AGCC altera la secreción enteroendocrina de GLP-1 y PYY, influyendo en la ingesta calórica y adiposidad.",
    "references": [
      {
        "pmid": "23828891",
        "title": "The microbial metabolites, short-chain fatty acids, regulate colonic Treg cell homeostasis",
        "authors": "Smith PM et al.",
        "journal": "Science",
        "year": "2013",
        "doi": "10.1126/science.1241165",
        "url": "https://pubmed.ncbi.nlm.nih.gov/23828891/"
      },
      {
        "pmid": "22190648",
        "title": "Short-chain fatty acids stimulate glucagon-like peptide-1 secretion via the G-protein-coupled receptor FFAR2",
        "authors": "Tolhurst G et al.",
        "journal": "Diabetes",
        "year": "2012",
        "doi": "10.2337/db11-1019",
        "url": "https://pubmed.ncbi.nlm.nih.gov/22190648/"
      }
    ]
  },
  {
    "id": "acidos_biliares",
    "name": "Metabolismo de Ácidos Biliares y Lípidos",
    "subtitle": "Hidrolasas BSH, 7α-deshidroxilación y receptores FXR / TGR5",
    "description": "Las dietas ricas en grasas aumentan la secreción biliar conjugada con taurina en ratones. Bacterias con BSH (Lactobacillus, Parabacteroides, Turicibacter) o reductoras de sulfito (Bilophila) transforman este pool biliar.",
    "hfdImpactSummary": "La expansión de taxones tolerantes a bilis como Bilophila wadsworthia suele asociarse a mayor carga lipídica y generación de H₂S.",
    "hypothesisNote": "Hipótesis: La alteración del perfil de ácidos biliares secundarios reduce la activación protectora de TGR5/FXR y promueve esteatosis hepática.",
    "references": [
      {
        "pmid": "22722865",
        "title": "Dietary-fat-induced taurocholic acid promotes pathobiont expansion and colitis in Il10-/- mice",
        "authors": "Devkota S et al.",
        "journal": "Nature",
        "year": "2012",
        "doi": "10.1038/nature11225",
        "url": "https://pubmed.ncbi.nlm.nih.gov/22722865/"
      },
      {
        "pmid": "31595814",
        "title": "Diversification of host bile acids by members of the gut microbiota",
        "authors": "Winston JA et al.",
        "journal": "Gut Microbes",
        "year": "2020",
        "doi": "10.1080/19490976.2019.1674124",
        "url": "https://pubmed.ncbi.nlm.nih.gov/31595814/"
      }
    ]
  },
  {
    "id": "barrera_mucina_lps",
    "name": "Integridad de Mucina y Carga de Endotoxina (LPS)",
    "subtitle": "Renovación del moco epitelial frente a endotoxemia metabólica",
    "description": "El equilibrio entre degradadores benéficos de mucina (Akkermansia muciniphila) y bacterias Gram-negativas productoras de LPS proinflamatorio determina la permeabilidad intestinal.",
    "hfdImpactSummary": "La alteración de Akkermansia combinada con cambios en Desulfovibrio o Enterobacteriaceae se asocia con translocación de LPS hacia circulación sistémica.",
    "hypothesisNote": "Hipótesis: La endotoxemia metabólica crónica de bajo grado activa TLR4 en tejido adiposo e hígado, impulsando resistencia a la insulina.",
    "references": [
      {
        "pmid": "17456850",
        "title": "Metabolic endotoxemia initiates obesity and insulin resistance",
        "authors": "Cani PD et al.",
        "journal": "Diabetes",
        "year": "2007",
        "doi": "10.2337/db06-1491",
        "url": "https://pubmed.ncbi.nlm.nih.gov/17456850/"
      },
      {
        "pmid": "33505393",
        "title": "Role of Metabolic Endotoxemia in Systemic Inflammation and Potential Interventions",
        "authors": "Mohammad S et al.",
        "journal": "Front Immunol",
        "year": "2020",
        "doi": "10.3389/fimmu.2020.594150",
        "url": "https://pubmed.ncbi.nlm.nih.gov/33505393/"
      }
    ]
  }
];
