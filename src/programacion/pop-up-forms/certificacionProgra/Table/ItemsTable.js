import React from "react";
import { View, StyleSheet } from "@react-pdf/renderer";
import TableRow from "./TableRow";

const styles = StyleSheet.create({
    tableContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        margin:10
    },
});

const ItemsTable = ({ data }) => (
    <View style={styles.tableContainer}>
        {/*<TableHeader />*/}
        <TableRow items={data} />
        {/*<TableFooter items={data.items} />*/}
    </View>
);

export default ItemsTable;