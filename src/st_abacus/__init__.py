from pathlib import Path
from typing import Optional

import streamlit as st
import streamlit.components.v1 as components

# Tell streamlit that there is a component called st_abacus,
# and that the code to display that component is in the "frontend" folder
frontend_dir = (Path(__file__).parent / "frontend").absolute()
_component_func = components.declare_component(
	"st_abacus", path=str(frontend_dir)
)

# Create the python function that will be called
def st_abacus(
    rows=4, beadsPerRow=10, key=None
):
    """
    Add a descriptive docstring
    """
    return _component_func(rows=rows, beadsPerRow=beadsPerRow, key=key, default=[0]*rows)



def main():
    st.write('enter: st.abacus()')
    value = st_abacus()
    st.write(value)



if __name__ == "__main__":
    main()

