<?xml version="1.0"?>

<!--
  This transform instruments a SWF file to print out the frame index and sprite ID for each
  show frame tag. The instrumented file can be executed in the debugger player to dump out
  all the trace output.

  To use this script you must first install swfmill and xsltproc. A typical use of this
  script looks something like this:

    swfmill swf2xml file.swf file.xml
    xsltproc utils/instrument-swf.xslt file.xml | swfmill xml2swf stdin file.instrumented.swf

-->

<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
<xsl:output method="xml" indent="yes"/>

<xsl:template match="@*|node()">
 <xsl:copy>
  <xsl:apply-templates select="@*|node()">
 </xsl:apply-templates></xsl:copy>
</xsl:template>

<xsl:template match="Header/tags/ShowFrame">
 <xsl:variable name="frameNumber" select="count(preceding-sibling::ShowFrame)"/>
 <DoAction><actions><PushData><items><StackString value="R {$frameNumber}"/></items></PushData><Trace/><EndAction/></actions></DoAction>
 <ShowFrame/>
</xsl:template>

<xsl:template match="DefineSprite/tags/ShowFrame">
 <xsl:variable name="frameNumber" select="count(preceding-sibling::ShowFrame)"/>
 <xsl:variable name="spriteObjectID" select="../../@objectID"/>
 <DoAction><actions><PushData><items><StackString value="S {$spriteObjectID} {$frameNumber}"/></items></PushData><Trace/><EndAction/></actions></DoAction>
 <ShowFrame/>
</xsl:template>

</xsl:stylesheet>

