#!/bin/sh
if [ ! -e vendor ] && [ -e node_modules ]; then
    ln -s node_modules vendor
fi