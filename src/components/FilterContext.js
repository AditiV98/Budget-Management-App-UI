import React, { createContext, useContext, useState } from "react";
import dayjs from "dayjs"; // For handling dates

const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
    // Default: Current month start & end
    const [selectedMonth, setSelectedMonth] = useState({
        startDate: dayjs().startOf("month").format("YYYY-MM-DD"),
        endDate: dayjs().endOf("month").format("YYYY-MM-DD"),
    });

    const updateMonth = (monthOrRange) => {
        if (typeof monthOrRange === "object" && monthOrRange.startDate && monthOrRange.endDate) {
            // Handle Custom Date Range
            setSelectedMonth({
                startDate: dayjs(monthOrRange.startDate).format("YYYY-MM-DD"),
                endDate: dayjs(monthOrRange.endDate).format("YYYY-MM-DD"),
            });
        } else if (typeof monthOrRange === "string") {
            // Handle Predefined Month Selection
            setSelectedMonth({
                startDate: dayjs(monthOrRange).startOf("month").format("YYYY-MM-DD"),
                endDate: dayjs(monthOrRange).endOf("month").format("YYYY-MM-DD"),
            });
        } else {
            console.error("Invalid date input:", monthOrRange);
        }
    };

    return (
        <FilterContext.Provider value={{ selectedMonth, updateMonth }}>
            {children}
        </FilterContext.Provider>
    );
};

export const useFilterContext = () => useContext(FilterContext);
