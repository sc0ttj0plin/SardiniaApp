import { gql } from 'apollo-boost';
import * as Constants from '../constants';


export const autocompleteQuery = gql`
query ($queryStr: String, $vidsInclude: [Int!], $typesExclude: [String!]) {
  autocomplete(args: {search: $queryStr},
    order_by: {rank: desc},
    limit: 20,
    where: { _or: [{ _and: [ {nid: {_is_null: true}}, {term: {vid: {_in: $vidsInclude}}}]},
          {_and: [{nid: {_is_null: false}}, {node: {type: {_nin: $typesExclude}}} ]}]}){
    keywords
    rank
    nid
    tid
    term {
      uuid
      vid
      vocabulary {
        name
      }
    }
    node {
      type
      nid
      uuid
      title: legacy(path: "title_field")
    }
  }
}
`

export const searchQuery = gql`
query ($queryStr: String, $nodeTypes: [String!]) {
  search(args: {search: $queryStr}, order_by: {rank: desc}, where: {tid: {_is_null: true}, node: {type: {_in: $nodeTypes}}}) {
    headline
    rank
    nid
    term {
      uuid
      vid
      vocabulary {
        name
      }
    }
    node {
      type
      nid
      uuid
      title: legacy(path: "title_field")
    }
  }
}
`

export const getCategoriesQuery = gql`
query ($vid: Int) {
    terms(where: {vid: {_eq: $vid}, parent: {_is_null: true}}) {
      parent
      tid
      name
      uuid
      marker: legacy(path: "field_marker_mappa.und[0].uri")
      image: image_calc
      nodes_terms_aggregate {
        aggregate {
          count
        }
      }
      terms {
        parent
        name
        tid
        uuid
        image: image_calc
        marker: legacy(path: "field_marker_mappa.und[0].uri")
        nodes_terms_aggregate {
          aggregate {
            count
          }
        }
        terms {
          parent
          name
          tid
          uuid
          image: image_calc
          marker: legacy(path: "field_marker_mappa.und[0].uri")
          nodes_terms_aggregate {
            aggregate {
              count
            }
          }
        }
      }
    }
  }
 `;

export const getClusters = gql`
query ($cats: _text, $polygon: String, $dbscan_eps: float8, $types: _text) {
  clusters: get_cluster_terms(args: {cats: $cats, dbscan_eps: $dbscan_eps, within_polygon: $polygon, types: $types}) {
    centroid
    cluster
    count
    terms_objs
  }
}
`;


// term: {tid: {_in: $types}}, removed from where clause because query didn't work with it
export const getEvents = gql`
query ($start: Int, $end: Int, $types: [Int!]) {
  events: nodes(where: {type: {_eq: "${Constants.NODE_TYPES.events}"}, date1: {_gte: $start, _lte: $end}, term: {tid: {_in: $types}}}, order_by: {date1: asc}) {
    title: legacy(path: "title_field")
    description: legacy(path: "body")
    type
    date1
    date2
    uuid
    nid: legacy(path: "nid")
    term {
      tid
      name
      uuid
    }
    steps: legacy(path: "steps")
    image: legacy(path: "field_immagine_top.und[0].uri")
    language
    abstract: legacy(path: "field_occhiello")
    itinerary: legacy(path: "field_riassunto_tappe_georef.und")
    url_alias: legacy(path: "url_alias")
  }
}
`;


export const getEventsById = gql`
query ($uuids: [String!]) {
  events: nodes(where: { uuid: {_in: $uuids} }) {
    title: legacy(path: "title_field")
    description: legacy(path: "body")
    uuid
    type
    date1
    date2
    nid: legacy(path: "nid")
    term {
      tid
      name
      uuid
    }
    steps: legacy(path: "steps")
    image: legacy(path: "field_immagine_top.und[0].uri")
    language
    #body #this is single language, from legacy we grab the multilan version
    abstract: legacy(path: "field_occhiello")
    itinerary: legacy(path: "field_riassunto_tappe_georef.und")
    url_alias: legacy(path: "url_alias")
  }
}
`;


export const getItineraries = gql`
query {
  itineraries: nodes(where: {type: {_eq: "${Constants.NODE_TYPES.itineraries}"}}) {
    nid
    uuid
    type
    title: legacy(path: "title_field")
    abstract: legacy(path: "field_occhiello")
    subtitle: legacy(path: "field_citazione_iniziale")
    description: legacy(path: "body")
    term {
      tid
      name
      uuid
    }
    image: legacy(path: "field_immagine_top.und[0].uri")
    gallery: legacy(path: "field_galleria_multimediale.und")
    url_alias: legacy(path: "url_alias")
    relatedPois: legacy(path: "field_attrattori_citati")
    seeMorePois: legacy(path: "field_vedi_anche")
    stages(order_by: {index: asc}) {
      language
			index
			title
			body
      poi {
        uuid
        nid
        georef
        image: legacy(path: "field_immagine_top.und[0].uri")
      }
		}
  }
}
`;

export const getItinerariesById = gql`
    query ($uuids: [String!]) {
      itineraries: nodes(where: {type: {_eq: "${Constants.NODE_TYPES.itineraries}"}, uuid: {_in: $uuids}}) {
        nid
        uuid
        type
        title: legacy(path: "title_field")
        abstract: legacy(path: "field_occhiello")
        subtitle: legacy(path: "field_citazione_iniziale")
        description: legacy(path: "body")
        term {
          tid
          name
          uuid
        }
        image: legacy(path: "field_immagine_top.und[0].uri")
        gallery: legacy(path: "field_galleria_multimediale.und")
        url_alias: legacy(path: "url_alias")
        relatedPois: legacy(path: "field_attrattori_citati")
        seeMorePois: legacy(path: "field_vedi_anche")
        stages(order_by: {index: asc}) {
          language
          index
          title
          body
          poi {
            uuid
            nid
            georef
            image: legacy(path: "field_immagine_top.und[0].uri")
          }
        }
      }
    }
`


export const getEventTypes = gql`
query {
  eventTypes: nodes_terms_aggregate(where: {node: {type: {_eq: "${Constants.NODE_TYPES.events}"}}, field: {_eq: "field_tipo_di_evento"}}, distinct_on: term_uuid) {
    nodes {
      nid
      uuid: term_uuid
      #term_uuid
      #field
      term {
        tid
        name
        uuid
        vocabulary {
          name
        }
      }
    }
    aggregate {
      count
    }
  }
}
`;


export const getPoi = gql`
query ($uuid: String, $nid: Int) {
  nodes(where: { uuid: {_eq: $uuid}, nid: {_eq: $nid} }) {
    nid
    uuid
    type
    title: legacy(path: "title_field")
    description: legacy(path: "body")
    georef
    nodes_linked(where: {field: {_eq: "cosa_vedere"}, node: {type: {_eq: "${Constants.NODE_TYPES.places}"}}}) {
      node {
        title
        nid
        uuid
        term {
          name
        }
        image: legacy(path: "field_immagine_top.und[0].uri")
      }
    }
    term {
      tid
      name
      uuid
    }
    image: legacy(path: "field_immagine_top.und[0].uri")
    #summary
    abstract: legacy(path: "field_occhiello")
    whyVisit: legacy(path: "field_why_visit")
    gallery: legacy(path: "field_galleria_multimediale.und")
    url_alias: legacy(path: "url_alias")
  }
}
`;

export const getNearPois = gql`
query ($polygon: geometry!, $uuids: [String!]) {
   nodes(
     where: {
       georef: 
         {_st_within: $polygon},
       term: { 
         nodes_terms: {term: {uuid: {_in: $uuids}}},
       },
       type: {_eq: "${Constants.NODE_TYPES.places}"},
       mobile: {_eq: true}
     }) {
     uuid
     nid
     type
     title: legacy(path: "title_field")
     georef
     term {
       tid
       name
       uuid
     }
     image: legacy(path: "field_immagine_top.und[0].uri")
   }
 }
`;


export const getNearestPois = gql`
query ($x: float8, $y: float8, $limit: Int, $offset: Int, $uuids: [String!]) {
  nearest_neighbour_no_limits(args: {x: $x, y: $y}, where: {nodes_terms: {term: {uuid: {_in: $uuids}}}, type: {_eq: "${Constants.NODE_TYPES.places}"}}, offset: $offset, limit: $limit, order_by: {distance: asc}) {
    uuid
    nid
    georef
    type
    title: legacy(path: "title_field")
    distance
    image: legacy(path: "field_immagine_top.und[0].uri")
    gallery: legacy(path: "field_galleria_multimediale.und")
    term {
      name
      uuid
      tid
    }
  }
}
`;

export const getNearestByType = gql`
query ($x: float8, $y: float8, $type: String!, $limit: Int!, $offset: Int!, $excludeUuids: [String!]) {
  nearest_neighbour_no_limits(args: {x: $x, y: $y}, where: {type: {_eq: $type}, uuid: {_nin: $excludeUuids}}, limit: $limit, offset: $offset, order_by: {distance: asc}) {
    uuid
    nid
    type
    georef
    title: legacy(path: "title_field")
    distance
    image: legacy(path: "field_immagine_top.und[0].uri")
    gallery: legacy(path: "field_galleria_multimediale.und")
    term {
      name
      uuid
      tid
    }
  }
}
`



export const getPois = gql`
query ($uuids: [String!]) {
  nodes(where: { uuid: {_in: $uuids} }) {
    uuid
    nid
    type
    title: legacy(path: "title_field")
    description: legacy(path: "body")
    georef
    distance
    term {
      tid
      name
      uuid
    }
    image: legacy(path: "field_immagine_top.und[0].uri")
    summary
    abstract: legacy(path: "field_occhiello")
    whyVisit: legacy(path: "field_why_visit")
    gallery: legacy(path: "field_galleria_multimediale.und")
    url_alias: legacy(path: "url_alias")
  }
}
`;

export const getInspirers = gql`
query ($limit: Int, $offset: Int, $uuids: [String!]) {
  nodes(where: {nodes_terms: {term: {uuid: {_in: $uuids}}}}, offset: $offset, limit: $limit) {
    nid
    uuid
    type
    title: legacy(path: "title_field")
    description: legacy(path: "body")
    nodes_terms(where: {term_uuid: {_in: $uuids}}) {
      term{
        tid
        name
        uuid
      }
    }
    image: legacy(path: "field_immagine_top.und[0].uri")
    summary
    abstract: legacy(path: "field_occhiello")
    whyVisit: legacy(path: "field_why_visit")
    gallery: legacy(path: "field_galleria_multimediale.und")
    url_alias: legacy(path: "url_alias")
  }
}
`;

export const getInspirer = gql`
query ($uuid: String, $vid: Int) {
  nodes(where: { uuid: {_eq: $uuid} } ) {
    uuid
    nid
    type
    title: legacy(path: "title_field")
    description: legacy(path: "body")
    nodes_terms(where: {term: {vid: {_eq: $vid}}}) {
      term{
        tid
        name
        uuid
      }
    }
    image: legacy(path: "field_immagine_top.und[0].uri")
    summary
    abstract: legacy(path: "field_occhiello")
    whyVisit: legacy(path: "field_why_visit")
    gallery: legacy(path: "field_galleria_multimediale.und")
    url_alias: legacy(path: "url_alias")
  }
}
`;

export const getInspirersById = gql`
query ($uuids: [String!], $vid: Int) {
  nodes(where: { uuid: {_in: $uuids} } ) {
    uuid
    nid
    type
    title: legacy(path: "title_field")
    description: legacy(path: "body")
    nodes_terms(where: {term: {vid: {_eq: $vid}}}) {
      term{
        tid
        name
        uuid
      }
    }
    image: legacy(path: "field_immagine_top.und[0].uri")
    summary
    abstract: legacy(path: "field_occhiello")
    whyVisit: legacy(path: "field_why_visit")
    gallery: legacy(path: "field_galleria_multimediale.und")
    url_alias: legacy(path: "url_alias")
  }
}
`;

export const getExtras = gql`
query ($uuids: [String!]) {
  nodes(where: { uuid: {_in: $uuids} }) {
    nid
    uuid
    type
    title: legacy(path: "title_field")
    abstract: legacy(path: "field_occhiello")
    subtitle: legacy(path: "field_citazione_iniziale") 
    description: legacy(path: "body")
    term {
      tid
      name
      uuid
    }
    image: legacy(path: "field_immagine_top.und[0].uri")
    gallery: legacy(path: "field_galleria_multimediale.und")
    url_alias: legacy(path: "url_alias")
    relatedPois: legacy(path: "relatedPois")
    relatedInspires: legacy(path: "relatedInspires")
    relatedEvents: legacy(path: "relatedEvents")
    relatedItineraries: legacy(path: "relatedItineraries")
  }
}
`;


export const getNodes = gql`
query ($limit: Int, $offset: Int, $type: String) {
  nodes(where: {type: {_eq: $type}}, offset: $offset, limit: $limit) {
    nid
    uuid
    type
    abstract: legacy(path: "field_occhiello")
    description: legacy(path: "body")
    title: legacy(path: "title_field")
    nodes_terms {
      term{
        tid
        name
        uuid
      }
    }
    image: legacy(path: "field_immagine_top.und[0].uri")
  }
}
`;


export const getNearestAccomodations = gql`
query ($x: float8, $y: float8, $limit: Int, $offset: Int, $uuids: [String!]) {
  nearest_neighbour_no_limits(args: {x: $x, y: $y}, where: {nodes_terms: {term: {uuid: {_in: $uuids}}}, type: {_eq: "${Constants.NODE_TYPES.accomodations}"}}, offset: $offset, limit: $limit, order_by: {distance: asc}) {
    uuid
    nid
    title: legacy(path: "title_field")
    georef
    distance
    image: legacy(path: "field_immagine_top.und[0].uri")
    gallery: legacy(path: "field_galleria_multimediale.und")
    email: legacy(path: "field_email.und[0].email")
    website: legacy(path: "field_sito_web_ricettive.und[0].url")
    address: legacy(path: "field_indirizzo.und[0].value")
    location: legacy(path: "field_localit.und[0].value")
    stars: legacy(path: "field_numero_stelle.und[0].value")
    phone: legacy(path: "telefono.und[0].value")
    term {
      name
      uuid
      tid
    }
  }
}
`;

export const getAccomodations = gql`
query ($limit: Int, $offset: Int) {
  nodes(where: {type: {_eq: "${Constants.NODE_TYPES.accomodations}"}}, offset: $offset, limit: $limit) {
    nid
    uuid
    type
    title: legacy(path: "title_field")
    georef
    distance
    image: legacy(path: "field_immagine_top.und[0].uri")
    gallery: legacy(path: "field_galleria_multimediale.und")
    email: legacy(path: "field_email.und[0].email")
    website: legacy(path: "field_sito_web_ricettive.und[0].url")
    address: legacy(path: "field_indirizzo.und[0].value")
    location: legacy(path: "field_localit.und[0].value")
    stars: legacy(path: "field_numero_stelle.und[0].value")
    phone: legacy(path: "telefono.und[0].value")
    term {
      name
    }
  }
}
`;

export const getAccomodationsById = gql`
query ($uuids: [String!]) {
  nodes(where: {type: {_eq: "${Constants.NODE_TYPES.accomodations}"}, uuid: {_in: $uuids} }) {
    nid
    uuid
    type
    title: legacy(path: "title_field")
    georef
    distance
    image: legacy(path: "field_immagine_top.und[0].uri")
    gallery: legacy(path: "field_galleria_multimediale.und")
    email: legacy(path: "field_email.und[0].email")
    website: legacy(path: "field_sito_web_ricettive.und[0].url")
    address: legacy(path: "field_indirizzo.und[0].value")
    location: legacy(path: "field_localit.und[0].value")
    stars: legacy(path: "field_numero_stelle.und[0].value")
    phone: legacy(path: "telefono.und[0].value")
    term {
      name
    }
  }
}
`;