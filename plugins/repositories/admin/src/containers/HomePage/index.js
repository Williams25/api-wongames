import React, { memo } from "react";
import styled from "styled-components";
import { Header } from "@buffetjs/custom";
import { Table } from "@buffetjs/core";

const Wrapper = styled.div`
  padding: 18px 30px;
  p {
    margin-top: 1rem;
  }
`;

const headers = [
  {
    name: "Name",
    value: "name",
  },
  {
    name: "Description",
    value: "description",
  },
  {
    name: "Url",
    value: "html_url",
  },
];

const rows = [
  {
    name: "Landing-page",
    description: "Code to the sales landing page",
    html_url: "https://github.com/Williams25/landing-page-won",
  },
  {
    name: "API Landing-page",
    description: "Code to the sales landing page",
    html_url: "https://github.com/Williams25/api-landing-page-won",
  },
  {
    name: "Won Games",
    description: "Code to the sales landing page",
    html_url: "https://github.com/Williams25/won-games",
  },
  {
    name: "API Won Games",
    description: "Code to the sales landing page",
    html_url: "https://github.com/Williams25/api-wongames",
  },
];

const HomePage = () => {
  return (
    <Wrapper>
      <Header
        title={{ label: "Ract Avançado Repositories" }}
        content="A list of our repositories in React Avançado courser."
      />

      <Table headers={headers} rows={rows}></Table>
    </Wrapper>
  );
};

export default memo(HomePage);
