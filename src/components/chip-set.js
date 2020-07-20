import React from "react";
import { useApolloClient, useMutation } from "@apollo/react-hooks";
import { GET_SORT_CARS } from "../pages/cars";
import Chip from "@material-ui/core/Chip";
import IconButton from "@material-ui/core/IconButton";
import FilterList from "@material-ui/icons/FilterList";
import Box from "@material-ui/core/Box";

import { GET_CARFORM } from "../pages/cars";
import { SORT_CARS, ADD_OR_REMOVE_FILTERS_CARS } from "./cars-forms";
import { Container } from "@material-ui/core";

const ChipSet = function({ handleFilterChange }) {
  const client = useApolloClient();
  const { filters, isFilterView, cars, viewCars } = client.readQuery({
    query: GET_CARFORM
  });

  const makeModels = [...new Set(cars.map(c => c.makeModel))];

  const [sortCars, { loading: sortLoading, error: sortError }] = useMutation(
    SORT_CARS
  );

  const [
    removeFilterCarsSort,
    { loading: removeFilterCarsLoading, error: removeFilterCarsError }
  ] = useMutation(ADD_OR_REMOVE_FILTERS_CARS, {
    onCompleted({ addOrRemoveFiltersCars }) {
      client.writeData({
        data: { filters: addOrRemoveFiltersCars.filters }
      });
      // instead of writing to the client, call the sortCars mutate function and let that mutation take care of writing to the client
      sortCars({
        variables: {
          cars: addOrRemoveFiltersCars.viewCars,
          sortAttribute: addOrRemoveFiltersCars.sortAttribute,
          isSortReverse: addOrRemoveFiltersCars.isSortReverse
        }
      });
    }
  });

  // const handleChipDelete = async event => {
  //   const target = event.target.closest("div[role='button']");
  //   const attribute = target.getAttribute("name");
  //   const values = [target.getAttribute("value")];
  //   // unchecked checkbox will show a false value?  Or null?
  //   const isChecked = false;
  //   // await query for cars
  //   const { cars, isAlphabetical } = await client.readQuery({
  //     query: GET_SORT_CARS
  //   });
  //   removeFilterCarsSort({
  //     variables: { attribute, values, isChecked, cars, makeModels },
  //     context: { isAlphabetical, makeModels }
  //   });
  // };

  return (
    <Container>
      <Box display="flex" alignItems="center" padding={2}>
        <Box flexGrow={1}>
          {Object.keys(filters)
            .filter(key => typeof filters[key] === "object")
            .map(key =>
              filters[key].map(filterValue => {
                return (
                  <Chip
                    label={filterValue}
                    value={filterValue}
                    name={key}
                    onDelete={handleFilterChange(
                      "chip",
                      key === "make" && true
                    )}
                  ></Chip>
                );
                // return <Chip label="label"></Chip>;
              })
            )
          // .flat()
          // .filter(filterValue => filterValue !== 999999)
          // .map(
          //   filterValue =>
          //     filterValue !== "Filters" && (
          //       <Chip
          //         label={filterValue}
          //         value={filterValue}
          //         onDelete={handleChipDelete}
          //       ></Chip>
          //     )
          // )}
          }
        </Box>
      </Box>

      {!isFilterView && (
        <Box display="flex" alignItems="center" padding={3.5} width="100%">
          <span>{viewCars.length} options</span>
          <Box flexGrow={1}></Box>

          <Box>
            <IconButton
              onClick={() => client.writeData({ data: { isFilterView: true } })}
            >
              <FilterList></FilterList>
            </IconButton>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default ChipSet;
