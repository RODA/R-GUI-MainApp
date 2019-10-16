# options(width = 1000, help_type = "html")

# do.call(options, list(width = 1000, help_type = "html"))


# RGUI_call(list(
#     library = list(package = "venn"),
#     options = list(width = 1000, help_type = "html")
# ))


attach(NULL, name = "RGUI") 
env <- as.environment("RGUI")

env$RGUI_first <- TRUE
env$RGUI_hashes <- list()
env$RGUI_visiblecols <- 8 # visible columns \
env$RGUI_visiblerows <- 17 # visible rows   / from (size of) the data editor in the GUI


env$RGUI_numhash <- function(x) {
    mean(as.integer(charToRaw(paste(capture.output(.Internal(inspect(x))), collapse = ""))))
}


env$RGUI_possibleNumeric <- function(x) {
    if (all(is.na(x))) {
        return(FALSE)
    }

    if (inherits(x, "haven_labelled")) {
        return(!any(is.na(suppressWarnings(as.numeric(names(attr(x, "labels")))))))
    }

    if (is.numeric(x)) {
        return(TRUE)
    }

    if (is.factor(x)) {
        return(!any(is.na(suppressWarnings(as.numeric(levels(x))))))
    }

    # as.character converts everything (especially factors)
    return(!any(is.na(suppressWarnings(as.numeric(na.omit(x))))))
}

env$RGUI_jsonify <- function(x, space = FALSE) {
    # x should ALWAYS  be a list
    # whose components are either:
    # - lists, when RGUI_jsonify() will be Recall()-ed recursively
    # or
    # - vectors

    nms <- names(x)
    result <- ""
    for (i in seq(length(x))) {

        xi <- x[[i]]

        if (inherits(xi, "list")) {
            
            if (length(xi) > 0) {
                nmsi <- names(xi)
                if (is.null(nmsi)) {
                    # unnamed list, ex. theData
                    result <- paste(result, "'", nms[i], "'", ": [", Recall(xi), "]",  sep = "")
                }
                else {
                    if (is.null(xi)) {
                        result <- paste(result, "'", nms[i], "'", ": undefined", sep = "")
                    }
                    else {
                        result <- paste(result, "'", nms[i], "'", ": {", Recall(xi), "}",  sep = "")
                    }
                }
            }
            else {
                result <- paste(result, "'", nms[i], "'", ": {}",  sep = "")
            }
        }
        else {
            # xi is a vector

            collapse <- ", "
            prefix <- ""
            if (is.character(xi)) {
                collapse <- "`, `"
                prefix <- "`"
            }
            
            if (is.logical(x[[i]])) {
                x[[i]] <- gsub("TRUE", "true", gsub("FALSE", "false", as.character(x[[i]])))
            }
            result <- paste(result,
                ifelse (is.null(nms[i]), 
                    sprintf(ifelse(length(x[[i]]) > 1, " [ %s%s%s ]", "%s%s%s"), prefix, paste(x[[i]], collapse = collapse), prefix),
                    sprintf(ifelse(length(x[[i]]) > 1, "'%s': [ %s%s%s ]", "'%s': %s%s%s"), nms[i], prefix, paste(x[[i]], collapse = collapse), prefix)
                )
            )

        }

        if (i < length(x)) {
            result <- paste(result, ",", sep = "")
        }
    }

    if (space) {
        return(result)
    }
    
    return(gsub(" ", "", result))
}

env$RGUI_scrollobj <- function(...) {
    env <- as.environment("RGUI")
    x <- list(...)
    # o sa intre in fata in lista de comenzi, pun informatiile in env si le folosesc mai tarziu
    scrollvh <- lapply(x$scrollvh, function(x) unlist(x) + 1)
    env$RGUI_visiblerows <- x$RGUI_visiblerows + 1
    env$RGUI_visiblecols <- x$RGUI_visiblecols + 1

    if (!x$alldata) {
        scrollvh <- scrollvh[x$dataset]
    }

    tosend <- vector(mode = "list", length = length(scrollvh))
    names(tosend) <- names(scrollvh)
    
    for (n in names(scrollvh)) {
        dimdata <- dim(globalenv()[[n]])
        nrowd <- dimdata[1]
        ncold <- dimdata[2]
        
        dscrollvh <- scrollvh[[n]]
        srow <- min(dscrollvh[1], nrowd - min(nrowd, x$RGUI_visiblerows) + 1)
        scol <- min(dscrollvh[2], ncold - min(ncold, x$RGUI_visiblecols) + 1)
        erow <- min(srow + x$RGUI_visiblerows, nrowd)
        ecol <- min(scol + x$RGUI_visiblecols, ncold)
        
        tosend[[n]] <- list(
            theData = unname(as.list(.GlobalEnv[[n]][seq(srow, erow), seq(scol, ecol), drop = FALSE])),
            dataCoords = paste(srow, scol, erow, ecol, ncold, sep = "_"),
            scrollvh = c(srow, scol) - 1
        )
    }
    
    return(env$RGUI_jsonify(list(scrollData = tosend)))
}

# TO DO: replace scrollvh as an argument with scrollvh from env
env$RGUI_infobjs <- function(objs) {
    env <- as.environment("RGUI")
    funargs <- lapply(match.call(), deparse)
    type <- funargs$objs
    
    if (!identical(type, "added") & !identical(type, "modified")) {
        type <- "infobjs"
    }

    visiblerows <- env$RGUI_visiblerows
    visiblecols <- env$RGUI_visiblecols

    toreturn <- list()
    
    objtype <- unlist(lapply(.GlobalEnv, function(x) {
        if (is.data.frame(x)) { # dataframes
            return(1)
        }
        else if (is.list(x) & !is.data.frame(x)) { # lists but not dataframes
            return(2)
        }
        else if (is.matrix(x)) { # matrices
            return(3)
        }
        else if (is.vector(x) & !is.list(x)) { # vectors
            return(4)
        }
        return(0)
    }))

    if (any(objtype > 0)) {
        if (any(objtype == 1)) { # data frames
            toreturn$dataframes <- lapply(names(objtype[objtype == 1]), function(n) {

                dscrollvh <- c(1, 1)

                if (is.element(n, names(env$RGUI_scrollvh))) {
                    dscrollvh <- env$RGUI_scrollvh[[n]]
                }

                nrowd <- nrow(.GlobalEnv[[n]])
                ncold <- ncol(.GlobalEnv[[n]])

                srow <- min(dscrollvh[1], nrowd - min(nrowd, visiblerows) + 1)
                scol <- min(dscrollvh[2], ncold - min(ncold, visiblecols) + 1)
                erow <- min(srow + visiblerows - 1, nrowd)
                ecol <- min(scol + visiblecols - 1, ncold)


                return(list(
                    nrows = nrowd,
                    ncols = ncold,
                    rownames = rownames(.GlobalEnv[[n]]),
                    colnames = colnames(.GlobalEnv[[n]]),
                    numerics = as.vector(unlist(lapply(.GlobalEnv[[n]], env$RGUI_possibleNumeric))),
                    calibrated = as.vector(unlist(lapply(.GlobalEnv[[n]], function(x) {
                        all(na.omit(x) >= 0 & na.omit(x) <= 1)
                    }))),
                    binary = as.vector(unlist(lapply(.GlobalEnv[[n]], function(x) all(is.element(x, 0:1))))),
                    scrollvh = c(srow, scol) - 1, # for Javascript
                    theData = unname(as.list(.GlobalEnv[[n]][seq(srow, erow), seq(scol, ecol), drop = FALSE])),
                    dataCoords = paste(srow, scol, erow, ecol, ncol(.GlobalEnv[[n]]), sep = "_")
                ))
                # scrollvh = c(srow, scol, min(visiblerows, nrow(x)), min(visiblecols, ncol(x))) - 1,
                # dataCoords = paste(c(srow, scol, erow, ecol, ncol(x)) - 1, collapse="_")
            })
            names(toreturn$dataframes) <- names(objtype[objtype == 1])
        }

        if (any(objtype == 2)) {
            toreturn$lists <- list(names = names(objtype[objtype == 2]))
        }

        if (any(objtype == 3)) {
            toreturn$matrices <- list(names = names(objtype[objtype == 3]))
        }

        if (any(objtype == 4)) {
            toreturn$vectors <- list(names = names(objtype[objtype == 4]))
        }

        toreturn <- list(toreturn)
        names(toreturn) <- type

        return(env$RGUI_jsonify(toreturn))
    }
}


env$RGUI_Changes <- function(x) {
    env <- as.environment("RGUI")
    # TODO: verify if file ChangeLog exists
    changes <- gsub("`", "'", readLines(system.file("ChangeLog", package = x)))
    return(env$RGUI_jsonify(list(changes = changes)))
}

env$RGUI_packages <- function(x) { # x contains the packages, as known by the webpage
    env <- as.environment("RGUI")
    attached <- data()$results[, -2]
    packages <- unique(attached[, "Package"])

    if (!identical(sort(packages), sort(x))) {
        # available <- suppressWarnings(data(package = .packages(all.available = TRUE)))$results[, -2]
        
        attached <- lapply(packages, function(x) {
            x <- attached[attached[, "Package"] == x, 2:3, drop = FALSE]
            x <- x[x[, 2] != "Internal Functions", , drop = FALSE] # to eliminate internal datasets in the QCA package
            
            if (nrow(x) == 0) return(list())
            
            titles <- as.list(x[, 2])
            names(titles) <- x[, 1]
            return(titles) # [1:2]
        })
        names(attached) <- packages
        return(env$RGUI_jsonify(list(packages = attached)))
    }
}

env$RGUI_dependencies <- function(x) { # x contains the packages, as known by the webpage
    env <- as.environment("RGUI")
    installed <- unlist(lapply(x, function(x) {
        if (identical(tryCatch(unlist(packageVersion(x)), error = function(e) return(0)), 0)) {
            return(FALSE)
        }
        return(TRUE)
    }))
    return(env$RGUI_jsonify(list(missing = x[!installed])))
}

env$RGUI_scrollvh <- function(...) {
    env <- as.environment("RGUI")
    # fie fac ceva cu ea, fie o sa intre in fata in lista de comenzi, pun informatiile in env si le folosesc mai tarziu
}

env$RGUI_editorsize <- function(visiblerows, visiblecols) {
    env <- as.environment("RGUI")
    env$RGUI_visiblerows <- visiblerows
    env$RGUI_visiblecols <- visiblecols
}

env$RGUI_call <- function(commandlist) {
    env <- as.environment("RGUI")

    nms <- names(commandlist)
    result <- c()
    
    # those which have a first Capital letter (such as RGUI_Changes) are called by menus
    for (n in nms) {
        if (is.element(n, c("source", "options", "library"))) {
            do.call(n, commandlist[[n]])
        }
        else {
            result <- c(result, do.call(paste("RGUI", n, sep = "_"), commandlist[[n]]))
        }
    }
    
    hashes <- lapply(globalenv(), env$RGUI_numhash)
    added <- setdiff(names(hashes), names(env$RGUI_hashes))
    deleted <- setdiff(names(env$RGUI_hashes), names(hashes))
    common <- intersect(names(hashes), names(env$RGUI_hashes))
    modified <- names(env$RGUI_hashes)[!is.element(env$RGUI_hashes[common], hashes[common])]
    env$RGUI_hashes <- hashes
    
    if (length(added) > 0) result <- c(result, RGUI_infobjs(added))
    if (length(modified) > 0) result <- c(result, RGUI_infobjs(modified))
    if (length(deleted) > 0) result <- c(result, RGUI_jsonify(list(deleted = deleted)))

    
    
    # temp <- tempfile()
    # utils::savehistory(file = temp) # only in Terminal, not working on MacOS
    # history <- readLines(temp)
    # lhistory <- length(history)

    # if (env$RGUI_first) {
    #     env$RGUI_first <- FALSE
        
    #     if (lhistory == 1) {
    #         lhistory <- 2
    #     }
    #     history[lhistory - 1] <- "library(QCA)"
    # }
    
    # writeLines(history[seq(lhistory - 1)], con = temp)
    # loadhistory(file = temp)
    # unlink(temp)

    if (length(result) > 0) {
        cat("{", paste(result, collapse = ", "), "}")
    }
}



rm(env)
