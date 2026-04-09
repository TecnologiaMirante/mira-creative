export const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: 44,
    borderRadius: 16,
    borderColor: state.isFocused ? "rgba(99, 102, 241, 0.65)" : "rgba(203, 213, 225, 0.9)",
    boxShadow: state.isFocused
      ? "0 0 0 4px rgba(99, 102, 241, 0.12)"
      : "0 10px 24px -18px rgba(15, 23, 42, 0.35)",
    backgroundColor: "rgba(255,255,255,0.88)",
    backdropFilter: "blur(10px)",
    paddingLeft: 4,
    paddingRight: 4,
    "&:hover": {
      borderColor: "rgba(99, 102, 241, 0.5)",
    },
  }),
  valueContainer: (base) => ({
    ...base,
    paddingTop: 2,
    paddingBottom: 2,
  }),
  placeholder: (base) => ({
    ...base,
    color: "#64748b",
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
  menu: (base) => ({
    ...base,
    zIndex: 9999,
    overflow: "hidden",
    borderRadius: 18,
    border: "1px solid rgba(226,232,240,0.9)",
    boxShadow: "0 30px 60px -28px rgba(15, 23, 42, 0.45)",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "rgba(79, 70, 229, 0.14)"
      : state.isFocused
        ? "rgba(99, 102, 241, 0.08)"
        : "white",
    color: "#1e293b",
    cursor: "pointer",
  }),
};

export const selectPortalTarget =
  typeof document !== "undefined" ? document.body : null;
