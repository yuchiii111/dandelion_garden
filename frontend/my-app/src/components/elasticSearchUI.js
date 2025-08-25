import React, { useState, useRef, useEffect } from 'react';
// import AppSearchAPIConnector from "@elastic/search-ui-app-search-connector";
import {
    PagingInfo,
    ResultsPerPage,
    Paging,
    Facet,
    SearchProvider,
    Results,
    SearchBox,
    Sorting
  } from "@elastic/react-search-ui";
import { Layout } from "@elastic/react-search-ui-views";
import "@elastic/react-search-ui-views/lib/styles/styles.css";

// const connector = new AppSearchAPIConnector({
//     searchKey: "[YOUR_SEARCH_KEY]",
//     engineName: "video-games",
//     hostIdentifier: "[YOUR_HOST_IDENTIFIER]"
//   });
   
  // Step #3: Configuration options
//   const configurationOptions = {
//     apiConnector: connector
//     // Let's fill this in together.
//   };
  
  export default function ElasticSearcher() {
    return (
        <Layout
        header={<SearchBox />}
        bodyContent={<Results titleField="name" urlField="image_url" />}
        sideContent={
          <div>
            <Sorting
              label={"Sort by"}
              sortOptions={[
                {
                  name: "Relevance",
                  value: "",
                  direction: ""
                },
                {
                  name: "Name",
                  value: "name",
                  direction: "asc"
                }
              ]}
            />
            <Facet field="user_score" label="User Score" />
            <Facet field="critic_score" label="Critic Score" />
            <Facet field="genre" label="Genre" />
            <Facet field="publisher" label="Publisher" isFilterable={true} />
            <Facet field="platform" label="Platform" />
          </div>
        }
        bodyHeader={
          <>
            <PagingInfo />
            <ResultsPerPage />
          </>
        }
        bodyFooter={<Paging />}
      />
    );
  }
