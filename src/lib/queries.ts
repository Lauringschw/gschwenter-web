// src/lib/queries.ts
import { gql } from "@apollo/client";

export const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      user {
        id
        username
      }
    }
  }
`;

export const GET_ARTWORKS = gql`
  query GetArtworks($filter: ArtworkFilter, $limit: Int, $offset: Int) {
    artworks(filter: $filter, limit: $limit, offset: $offset) {
      id
      title
      artist_name
      year_created
      medium
      dimensions
      condition_status
      acquisition_date
      acquisition_price
      current_value
      location_in_collection
      category {
        id
        name
      }
      primary_image {
        id
        image_path
        image_name
      }
      created_at
    }
    artworkCount(filter: $filter)
  }
`;

export const GET_ARTWORK = gql`
  query GetArtwork($id: ID!) {
    artwork(id: $id) {
      id
      title
      artist_name
      year_created
      medium
      dimensions
      edition_number
      provenance
      condition_status
      acquisition_date
      acquisition_price
      current_value
      location_in_collection
      description
      notes
      category {
        id
        name
      }
      images {
        id
        image_path
        image_name
        is_primary
        sort_order
        file_type
        mime_type
        thumbnail_path
      }
      created_at
      updated_at
    }
  }
`;

export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
      parent_id
      parent {
        id
        name
      }
      children {
        id
        name
      }
    }
  }
`;

export const SEARCH_ARTWORKS = gql`
  query SearchArtworks($query: String!, $limit: Int) {
    searchArtworks(query: $query, limit: $limit) {
      id
      title
      artist_name
      year_created
      medium
      dimensions
      location_in_collection
      primary_image {
        image_path
      }
    }
  }
`;

export const GET_COLLECTION_STATS = gql`
  query GetCollectionStats {
    collectionStats {
      total_artworks
      total_value
      categories_count
      artists_count
      recent_acquisitions {
        id
        title
        artist_name
        acquisition_date
        medium
        dimensions
        location_in_collection
        primary_image {
          image_path
        }
      }
    }
  }
`;

export const CREATE_ARTWORK = gql`
  mutation CreateArtwork($input: ArtworkInput!) {
    createArtwork(input: $input) {
      id
      title
      artist_name
      year_created
      medium
      dimensions
      edition_number
      provenance
      condition_status
      acquisition_date
      acquisition_price
      current_value
      location_in_collection
      description
      notes
      category {
        id
        name
      }
    }
  }
`;

export const UPDATE_ARTWORK = gql`
  mutation UpdateArtwork($id: ID!, $input: ArtworkUpdateInput!) {
    updateArtwork(id: $id, input: $input) {
      id
      title
      artist_name
      year_created
      medium
      dimensions
      edition_number
      provenance
      condition_status
      acquisition_date
      acquisition_price
      current_value
      location_in_collection
      description
      notes
      category {
        id
        name
      }
    }
  }
`;

export const DELETE_ARTWORK = gql`
  mutation DeleteArtwork($id: ID!) {
    deleteArtwork(id: $id)
  }
`;

export const ADD_IMAGE_TO_ARTWORK = gql`
  mutation AddImageToArtwork(
    $artwork_id: ID!
    $image_path: String!
    $image_name: String!
    $is_primary: Boolean
    $file_type: String
    $mime_type: String
    $thumbnail_path: String
  ) {
    addImageToArtwork(
      artwork_id: $artwork_id
      image_path: $image_path
      image_name: $image_name
      is_primary: $is_primary
      file_type: $file_type
      mime_type: $mime_type
      thumbnail_path: $thumbnail_path
    ) {
      id
      image_path
      image_name
      is_primary
      file_type
      mime_type
      thumbnail_path
    }
  }
`;

export const REMOVE_IMAGE_FROM_ARTWORK = gql`
  mutation RemoveImageFromArtwork($id: ID!) {
    removeImageFromArtwork(id: $id)
  }
`;

export const SET_PRIMARY_IMAGE = gql`
  mutation SetPrimaryImage($id: ID!) {
    setPrimaryImage(id: $id)
  }
`;

export const GET_ARTISTS = gql`
  query GetArtists {
    getArtists
  }
`;

export const CREATE_CATEGORY = gql`
  mutation CreateCategory($name: String!, $parent_id: ID) {
    createCategory(name: $name, parent_id: $parent_id) {
      id
      name
      parent_id
      parent {
        id
        name
      }
    }
  }
`;

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($id: ID!, $name: String!) {
    updateCategory(id: $id, name: $name) {
      id
      name
      parent_id
      parent {
        id
        name
      }
    }
  }
`;

export const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id)
  }
`;

export const GET_ME = gql`
  query GetMe {
    me {
      id
      username
      created_at
    }
  }
`;
